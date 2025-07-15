document.addEventListener('DOMContentLoaded', () => {
    const articleContentEl = document.getElementById('article-content');
    const tocNavEl = document.getElementById('toc-nav');
    const themeToggleBtn = document.getElementById('theme-toggle');

    let headings = [];

    // 1. 动态加载文章内容
    async function loadContent() {
        try {
            const response = await fetch('article_content.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            renderArticle(data);
            buildToc();
            setupScrollSpy();
        } catch (error) {
            articleContentEl.innerHTML = `<p>加载内容失败: ${error.message}</p>`;
        }
    }

    function renderArticle(data) {
        let html = '';
        data.sections.forEach(section => {
            const animationClass = 'class="animated-element"';
            switch (section.type) {
                case 'h1':
                case 'h2':
                case 'h3':
                    html += `<${section.type} id="${section.id}" ${animationClass}>${section.content}</${section.type}>`;
                    break;
                case 'p':
                    html += `<p ${animationClass}>${section.content}</p>`;
                    break;
                case 'code':
                    html += `<div class="card code-block animated-element"><pre><code>${section.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre></div>`;
                    break;
                case 'video':
                    html += `
                        <div class="card video-card animated-element">
                            <a href="https://www.youtube.com/watch?v=${section.videoId}" target="_blank">
                                <img src="${section.thumbnail}" alt="${section.title}">
                            </a>
                            <div class="video-card-title">${section.title}</div>
                        </div>`;
                    break;
                case 'quote':
                    html += `
                        <blockquote class="card quote-card animated-element">
                            <div class="quote-card-title">
                                <a href="${section.url}" target="_blank">${section.title}</a>
                            </div>
                            <p class="quote-card-excerpt">${section.excerpt}</p>
                        </blockquote>`;
                    break;
                case 'social':
                     html += `
                        <div class="card social-card animated-element">
                            <div class="social-avatar">
                                <img src="${section.avatar}" alt="avatar">
                            </div>
                            <div class="social-content">
                                <div class="social-user">${section.user}</div>
                                <div class="social-text">${section.content}</div>
                            </div>
                        </div>`;
                    break;
            }
        });
        articleContentEl.innerHTML = html;
    }

    // 2. 构建目录
    function buildToc() {
        headings = Array.from(articleContentEl.querySelectorAll('h1, h2, h3'));
        const tocList = document.createElement('ul');
        
        headings.forEach(heading => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            
            link.textContent = heading.textContent;
            link.href = `#${heading.id}`;
            link.className = `toc-${heading.tagName.toLowerCase()}`;
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth' });
            });

            listItem.appendChild(link);
            tocList.appendChild(listItem);
        });

        tocNavEl.appendChild(tocList);
    }

    // 3. 设置滚动监听 (Scroll Spy)
    function setupScrollSpy() {
        const onScroll = () => {
            let current = '';

            headings.forEach(heading => {
                const headingTop = heading.getBoundingClientRect().top;
                if (headingTop <= 100) { // 100px的偏移量
                    current = heading.getAttribute('id');
                }
            });

            const tocLinks = tocNavEl.querySelectorAll('a');
            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', onScroll);
    }

    // 4. 主题切换
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        // 在真实插件中，会使用chrome.storage保存用户偏好
    });
    
    // 5. 设置入场动画
    function setupIntersectionObserver() {
        const animatedElements = document.querySelectorAll('.animated-element');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // 动画只播放一次
                }
            });
        }, {
            threshold: 0.1 // 元素进入视口10%时触发
        });

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // 初始化
    loadContent().then(() => {
        // 内容加载并渲染完成后再设置动画观察者
        setupIntersectionObserver();
    });
});
