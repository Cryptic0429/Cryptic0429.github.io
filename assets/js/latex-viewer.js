document.addEventListener('DOMContentLoaded', function () {
    var statusNode = document.querySelector('[data-latex-status]');
    var placeholder = document.querySelector('[data-latex-placeholder]');
    var renderRoot = document.querySelector('[data-latex-render]');
    var currentFileNode = document.querySelector('[data-latex-current-file]');
    var fileInput = document.querySelector('[data-latex-file-input]');

    if (!statusNode || !placeholder || !renderRoot || !currentFileNode) {
        return;
    }

    function setStatus(message, tone) {
        statusNode.textContent = message;
        statusNode.className = 'status-text ' + (tone || 'neutral');
    }

    function setCurrentFile(label) {
        currentFileNode.textContent = '当前文件：' + label;
    }

    function showRendered() {
        placeholder.hidden = true;
        renderRoot.hidden = false;
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function normalizeLatex(source) {
        var trimmed = source.trim();
        if (/\\documentclass/.test(trimmed) && /\\begin\{document\}/.test(trimmed)) {
            return trimmed;
        }

        return [
            '\\documentclass{article}',
            '\\usepackage[UTF8]{ctex}',
            '\\usepackage{amsmath,amssymb,amsthm}',
            '\\usepackage{geometry}',
            '\\geometry{a4paper, margin=1in}',
            '\\begin{document}',
            trimmed,
            '\\end{document}'
        ].join('\n');
    }

    function renderLatex(source, label) {
        setCurrentFile(label);
        renderRoot.innerHTML = '';

        try {
            var normalized = normalizeLatex(source);
            var generator = new latexjs.HtmlGenerator({ hyphenate: false });
            latexjs.parse(normalized, { generator: generator });
            renderRoot.appendChild(generator.domFragment());
            showRendered();
            setStatus('LaTeX 已成功渲染。', 'success');
        } catch (error) {
            renderRoot.innerHTML = '<pre class="latex-error-block">' + escapeHtml(source) + '</pre>';
            showRendered();
            setStatus('LaTeX 渲染失败，下面已回退显示原始内容。', 'error');
        }
    }

    function isAllowedPath(path) {
        return /^latex\/[A-Za-z0-9._/-]+\.tex$/i.test(path) && path.indexOf('..') === -1;
    }

    async function loadFromPath(path) {
        if (!isAllowedPath(path)) {
            setCurrentFile('非法路径');
            setStatus('只允许读取 `latex/` 目录下的 `.tex` 文件。', 'error');
            return;
        }

        setCurrentFile(path);
        setStatus('正在读取并渲染 LaTeX 文件...', 'neutral');

        try {
            var response = await fetch(path);
            if (!response.ok) {
                throw new Error('Failed to fetch file');
            }
            var text = await response.text();
            renderLatex(text, path);
        } catch (error) {
            setStatus('读取文件失败。如果你是直接打开本地 HTML，请改用本地静态服务器，或使用文件选择器。', 'error');
        }
    }

    if (fileInput) {
        fileInput.addEventListener('change', function (event) {
            var file = event.target.files && event.target.files[0];
            if (!file) return;

            setCurrentFile(file.name);
            setStatus('正在读取本地文件...', 'neutral');

            var reader = new FileReader();
            reader.onload = function () {
                renderLatex(String(reader.result || ''), file.name);
            };
            reader.onerror = function () {
                setStatus('本地文件读取失败。', 'error');
            };
            reader.readAsText(file);
        });
    }

    var fileParam = new URLSearchParams(window.location.search).get('file');
    if (fileParam) {
        loadFromPath(fileParam);
    }
});
