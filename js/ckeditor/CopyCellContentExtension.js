import Snackbar from "../Snackbar";

var name = 'copy_cell_content';
var command = 'copy-cell-content';

function findTargetElement(editor) {
	var sel = editor.getSelection();
	var startElt = sel && sel.getStartElement();
	if (!startElt) return null;

	// Prefer the current table cell; if not in a table, fallback to the current paragraph.
	return startElt.getAscendant('td', true) || startElt.getAscendant('p', true)
        || startElt.getAscendant('h1', true)
        || startElt.getAscendant('h2', true)
        || startElt.getAscendant('h3', true)
        || startElt.getAscendant('h4', true)
        ;
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
		label: 'Copy Cell Content',
		command: command,
	});

	editor.addCommand(command, {
		exec: function (editor) {
			var targetElt = findTargetElement(editor);
			if (!targetElt) return;
			var selectedRanges = selectCopiedContent(editor, targetElt);

			var html = targetElt.getHtml() || '';
			var text = targetElt.getText() || '';

			copyContentToClipboard(html, text)
                .then(()=>{
                    Snackbar.show("Content copied to clipboard.", { type: 'success' });
                }).catch(function () {
                Snackbar.show("Failed to copy content to clipboard. Please try again.", { type: 'error' });
				return null;
			}).then(function () {
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

