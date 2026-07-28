import Snackbar from "../Snackbar";

var name = 'copy_table';
var command = 'copy-table';

function findSelectedTable(editor) {
	var sel = editor.getSelection();
	var startElt = sel && sel.getStartElement();
	if (!startElt) return null;

	// Copy only the table where the caret/selection currently sits.
	return startElt.getAscendant('table', true);
}

function fallbackCopyText(text) {
	return new Promise(function (resolve, reject) {
		try {
			var textarea = document.createElement('textarea');
			textarea.value = text;
			textarea.setAttribute('readonly', 'readonly');
			textarea.style.position = 'fixed';
			textarea.style.left = '-9999px';
			document.body.appendChild(textarea);
			textarea.select();
			var copied = document.execCommand('copy');
			document.body.removeChild(textarea);
			if (copied) resolve();
			else reject(new Error('Copy command failed.'));
		}
		catch (err) {
			reject(err);
		}
	});
}

function copyContentToClipboard(html, text) {
	if (navigator.clipboard && window.ClipboardItem && window.Blob) {
		return navigator.clipboard.write([
			new ClipboardItem({
				'text/html': new Blob([html], { type: 'text/html' }),
				'text/plain': new Blob([text], { type: 'text/plain' })
			})
		]).catch(function () {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				return navigator.clipboard.writeText(text);
			}
			return fallbackCopyText(text);
		});
	}

	if (navigator.clipboard && navigator.clipboard.writeText) {
		return navigator.clipboard.writeText(text);
	}

	return fallbackCopyText(text);
}

function selectCopiedContent(editor, targetElt) {
	var selection = editor.getSelection();
	if (!selection || !targetElt) return null;

	var range = new CKEDITOR.dom.range(editor.document);
	range.selectNodeContents(targetElt);
	selection.selectRanges([range]);
	return [range.clone()];
}

function restoreSelection(editor, ranges) {
	if (!ranges || !ranges.length) return;
	editor.focus();
	var selection = editor.getSelection();
	if (selection) selection.selectRanges(ranges);
}

function init(editor) {
	editor.ui.addButton(command, {
		label: 'Copy Selected Table',
		command: command,
	});

	editor.addCommand(command, {
		readOnly: 1,
		exec: function (editor) {
			var targetTable = findSelectedTable(editor);
			if (!targetTable) {
				Snackbar.show("Please place the cursor inside a table.", { type: 'warning' });
				return;
			}
			var selectedRanges = selectCopiedContent(editor, targetTable);

			var html = (targetTable.getOuterHtml && targetTable.getOuterHtml()) || '';
			var text = targetTable.getText() || '';

			copyContentToClipboard(html, text)
				.then(function () {
					Snackbar.show("Table copied to clipboard.", { type: 'success' });
				})
				.catch(function () {
					Snackbar.show("Failed to copy table to clipboard. Please try again.", { type: 'error' });
					return null;
				})
				.then(function () {
					// fallbackCopyText temporarily steals DOM selection, so restore editor selection.
					restoreSelection(editor, selectedRanges);
				});
		}
	});
}

export default {
	name: name,
	command: command,
	plugin: {
		init: init
	}
};

/***
 * @name variables
 * @type {{}}
 * @memberOf CKPlaceholder#
 */
