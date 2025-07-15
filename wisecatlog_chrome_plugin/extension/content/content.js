// content.js
console.log("WiseCatLog 内容脚本已注入");

/**
 * 分析当前页面的内容，提取标题结构
 * @returns {Array} 包含标题信息的数组
 */
function analyze_page_content() {
  const headers = document.querySelectorAll('h1, h2, h3');
  const toc_structure = [];
  let header_index = 0;

  headers.forEach(header => {
    if (header.innerText.trim() === '') return;
    if (!header.id) {
      header.id = `wisecatlog-header-${header_index}`;
    }
    toc_structure.push({
      id: header.id,
      text: header.innerText.trim(),
      level: parseInt(header.tagName.substring(1)),
    });
    header_index++;
  });

  return toc_structure;
}

/**
 * 根据提取的目录结构，创建并插入侧边栏UI
 * @param {Array} catalog - 包含标题信息的数组
 */
function create_toc_sidebar(catalog) {
  const container = document.createElement('div');
  container.id = 'wisecatlog-container';

  const header_div = document.createElement('div');
  header_div.className = 'wisecatlog-title';

  const title = document.createElement('span');
  title.textContent = '智能目录';

  const theme_toggle_btn = document.createElement('button');
  theme_toggle_btn.className = 'wisecatlog-theme-toggle';
  // SVG icons for sun and moon
  const sun_icon = `<svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zm-9-8c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1zm0 16c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1zM5.64 6.36c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L2.81 6.36c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L5.64 6.36zm14.14 12.72c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-1.41 1.41c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.41-1.41zM19.78 6.36l-1.41-1.41c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.41 1.41c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41zM4.22 19.07l1.41-1.41c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-1.41 1.41c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0z"/></svg>`;
  const moon_icon = `<svg viewBox="0 0 24 24"><path d="M12.3 4.9c.4-.2.6-.7.4-1.1-.2-.4-.7-.6-1.1-.4C7.2 5.4 4 9.2 4 13.5 4 18.2 7.8 22 12.5 22s8.5-3.8 8.5-8.5c0-2.9-1.5-5.5-3.8-7.1z"/></svg>`;

  header_div.appendChild(title);
  header_div.appendChild(theme_toggle_btn);
  container.appendChild(header_div);

  // --- Theme switching logic ---
  function set_theme(theme) {
    if (theme === 'dark') {
      container.classList.add('theme-dark');
      theme_toggle_btn.innerHTML = sun_icon;
    } else {
      container.classList.remove('theme-dark');
      theme_toggle_btn.innerHTML = moon_icon;
    }
  }

  theme_toggle_btn.addEventListener('click', () => {
    const is_dark = container.classList.contains('theme-dark');
    const new_theme = is_dark ? 'light' : 'dark';
    set_theme(new_theme);
    chrome.storage.sync.set({ wisecatlog_theme: new_theme });
  });

  // Load saved theme on startup
  chrome.storage.sync.get('wisecatlog_theme', (data) => {
    // Default to light theme if nothing is stored
    const current_theme = data.wisecatlog_theme || 'light';
    set_theme(current_theme);
  });

  const list = document.createElement('ul');
  list.className = 'wisecatlog-list';

  catalog.forEach(item => {
    const listItem = document.createElement('li');
    listItem.className = `wisecatlog-level-${item.level}`;

    const link = document.createElement('a');
    link.href = `#${item.id}`;
    link.textContent = item.text;

    listItem.appendChild(link);
    list.appendChild(listItem);
  });

  container.appendChild(list);
  document.body.appendChild(container);

  // 为卡片添加拖拽功能
  make_draggable(container);
}

/**
 * 使指定的元素可以被拖拽
 * @param {HTMLElement} element - 需要被拖拽的元素
 */
function make_draggable(element) {
  const header = element.querySelector('.wisecatlog-title');
  // Ensure we are selecting the header div, not the span inside it
  if (!header) return;
  let is_dragging = false;
  let offset_x = 0;
  let offset_y = 0;

  header.addEventListener('mousedown', (e) => {
    is_dragging = true;
    offset_x = e.clientX - element.offsetLeft;
    offset_y = e.clientY - element.offsetTop;

    document.addEventListener('mousemove', on_mouse_move);
    document.addEventListener('mouseup', on_mouse_up);
  });

  function on_mouse_move(e) {
    if (!is_dragging) return;
    // 使用 clientX/Y 来计算新位置
    let new_x = e.clientX - offset_x;
    let new_y = e.clientY - offset_y;

    // 保证窗口不会被拖出视窗范围
    const win_width = window.innerWidth;
    const win_height = window.innerHeight;
    const el_width = element.offsetWidth;
    const el_height = element.offsetHeight;

    new_x = Math.max(0, Math.min(new_x, win_width - el_width));
    new_y = Math.max(0, Math.min(new_y, win_height - el_height));

    element.style.left = `${new_x}px`;
    element.style.top = `${new_y}px`;
    // 拖动时移除固定的 right 样式，否则会冲突
    element.style.right = 'auto'; 
  }

  function on_mouse_up() {
    is_dragging = false;
    document.removeEventListener('mousemove', on_mouse_move);
    document.removeEventListener('mouseup', on_mouse_up);
  }
}

// 当文档加载完成后执行分析
window.addEventListener('load', () => {
  console.log('页面加载完成，开始分析目录结构...');
  const catalog = analyze_page_content();

  if (catalog.length > 0) {
    console.log('WiseCatLog 分析完成，发现目录结构：');
    console.table(catalog);
    create_toc_sidebar(catalog);
  } else {
    console.log('WiseCatLog 未在当前页面发现可供生成目录的标题。');
  }
});
