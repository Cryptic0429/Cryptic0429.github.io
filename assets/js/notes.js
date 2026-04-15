document.addEventListener('DOMContentLoaded', function () {
    var previewTriggers = Array.from(document.querySelectorAll('[data-open-pdf]'));
    var previewEmbed = document.querySelector('[data-pdf-embed]');
    var placeholder = document.querySelector('[data-pdf-placeholder]');
    var statusNode = document.querySelector('[data-pdf-status]');
    var downloadLinks = Array.from(document.querySelectorAll('[data-download-pdf]'));

    if (previewTriggers.length === 0 || !previewEmbed || !placeholder || !statusNode || downloadLinks.length === 0) {
        return;
    }

    var pdfUrl = previewTriggers[0].getAttribute('data-pdf-url') || 'circuit-notes.pdf';
    var busy = false;

    function setStatus(message, tone) {
        statusNode.textContent = message;
        statusNode.className = 'status-text ' + (tone || 'neutral');
    }

    function showPreview() {
        placeholder.hidden = true;
        previewEmbed.hidden = false;
        previewEmbed.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function pdfExists() {
        var protocol = window.location.protocol;
        if (protocol !== 'http:' && protocol !== 'https:') {
            return true;
        }

        try {
            var response = await fetch(pdfUrl, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async function loadPreview() {
        if (busy) return;
        busy = true;
        previewTriggers.forEach(function (trigger) {
            trigger.disabled = true;
        });
        setStatus('正在检查并加载 PDF 预览...', 'neutral');

        var exists = await pdfExists();
        if (!exists) {
            setStatus('未找到 circuit-notes.pdf，请先把文件放到当前目录后再试。', 'error');
            previewTriggers.forEach(function (trigger) {
                trigger.disabled = false;
            });
            busy = false;
            return;
        }

        if (!previewEmbed.getAttribute('src')) {
            previewEmbed.setAttribute('src', pdfUrl);
        }

        showPreview();
        setStatus('PDF 已尝试加载；若浏览器未显示预览，可直接使用下载按钮查看原件。', 'success');
        previewTriggers.forEach(function (trigger) {
            trigger.disabled = false;
        });
        busy = false;
    }

    downloadLinks.forEach(function (link) {
        link.setAttribute('href', pdfUrl);
    });

    previewTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', loadPreview);
    });

    if (new URLSearchParams(window.location.search).get('pdf') === '1') {
        loadPreview();
    }
});
