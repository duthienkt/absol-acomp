import Snackbar from "../Snackbar";

var name = 'copy_tables';
var command = 'copy-tables';



function collectAllTables(editor) {
	if (!editor || !editor.document) return null;
	var tables = editor.document.find('table');
	if (!tables || !tables.count || tables.count() === 0) return null;

	var htmlParts = [];
	var textParts = [];
	for (var i = 0; i < tables.count(); ++i) {
		var table = tables.getItem(i);
		if (!table) continue;
		if (table.getOuterHtml) htmlParts.push(table.getOuterHtml());
		if (table.getText) textParts.push(table.getText());
	}

	if (htmlParts.length === 0 && textParts.length === 0) return null;
	return {
		html: htmlParts.join('\n'),
		text: textParts.join('\n\n')
	};
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

function init(editor) {
	editor.ui.addButton(command, {
		label: 'Copy All Tables',
		command: command,
	});

	editor.addCommand(command, {
		readOnly: 1,
		exec: function (editor) {
			var tableContent = collectAllTables(editor);
			if (!tableContent) {
				Snackbar.show("No table found to copy.", { type: 'warning' });
				return;
			}

			copyContentToClipboard(tableContent.html, tableContent.text)
				.then(function () {
					Snackbar.show("All tables copied to clipboard.", { type: 'success' });
				})
				.catch(function () {
					Snackbar.show("Failed to copy tables to clipboard. Please try again.", { type: 'error' });
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
