'use strict';
console.log("脚本加载成功");


// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

const fetchFresh = url => fetch(url, { cache: "no-store" });

const renderMarkdown = source => marked.parse(
  source.replace(/==([^=\n]+)==/g, "<mark>$1</mark>")
);

const highlightCodeBlocks = container => {
  if (!window.hljs) return;
  container.querySelectorAll("pre code").forEach(block => hljs.highlightElement(block));
};

const preparePdfLinks = (container, basePath) => {
  container.querySelectorAll("a[href]").forEach(link => {
    const originalHref = link.getAttribute("href");
    if (!originalHref || !originalHref.split(/[?#]/)[0].toLowerCase().endsWith(".pdf")) return;

    if (!/^(?:[a-z]+:|\/|#)/i.test(originalHref) && !originalHref.startsWith(basePath)) {
      link.href = `${basePath}${originalHref.replace(/^\.\//, "")}`;
    }

    link.classList.add("pdf-link");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = "Open PDF in a new tab";
  });
};



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) {
  select.addEventListener("click", function () {
  	elementToggleFunc(this);
  });
}


// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("Script loaded");

  const postsList = document.querySelector('.blog-posts-list');
  const container = document.getElementById('blog-detail-container');

  // Format date like "Feb 23, 2022"
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Load blog list
  fetchFresh('data/blog/index.json')
    .then(res => {
      if (!res.ok) throw new Error(`Unable to load blog index (${res.status})`);
      return res.json();
    })
    .then(async ids => {
      const posts = await Promise.all(ids.map(async id => {
        try {
          const resp = await fetchFresh(`data/blog/${id}.md`);
          if (!resp.ok) throw new Error(`Unable to load blog ${id} (${resp.status})`);
          const text = await resp.text();
          const match = text.match(/^---\n([\s\S]+?)\n---/);
          if (!match) return null;

          const metaText = match[1];
          const meta = {};
          metaText.split('\n').forEach(line => {
            const [key, ...rest] = line.split(':');
            meta[key.trim()] = rest.join(':').trim();
          });

          return { id, ...meta };
        } catch (e) {
          console.error(`Failed to load blog ${id}`, e);
          return null;
        }
      }));

      const validPosts = posts.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));

      validPosts.forEach(post => {
        const li = document.createElement('li');
        li.className = 'blog-post-item';
        li.innerHTML = `
          <a href="#" class="blog-link" data-id="${post.id}">
            <div class="blog-content">
              <div class="blog-meta">
                <p class="blog-category">${post.category}</p>
                <span class="dot"></span>
                <time datetime="${post.date}">${formatDate(post.date)}</time>
              </div>
              <h3 class="h3 blog-item-title">${post.title}</h3>
              <p class="blog-text">Click to read more...</p>
            </div>
          </a>
        `;
        postsList.appendChild(li);
      });
    })
    .catch(error => {
      console.error("Error when loading blog index:", error);
      postsList.innerHTML = `<li class="content-load-error">Blog could not be loaded: ${error.message}</li>`;
    });

  // Click to load detail
  document.body.addEventListener('click', async (event) => {
    const link = event.target.closest('.blog-posts-list [data-id]');
    if (!link) return;

    event.preventDefault();
    const id = link.dataset.id;
    console.log("Blog clicked, id =", id);

    if (!container) {
      console.log("Cannot find blog-detail-container");
      return;
    }

    // Hide list, show loading
    postsList.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = `<p>Loading content ID=${id}...</p>`;

    try {
      // Load the reusable blog detail template.
      const response = await fetchFresh('templates/blog-detail.html');
      if (!response.ok) throw new Error(`Unable to load blog template (${response.status})`);
      const htmlText = await response.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlText;

      const blogContent = tempDiv.querySelector('#blog-container');
      if (!blogContent) {
        container.innerHTML = '<p>Blog template format error: cannot find #blog-container</p>';
        return;
      }

      // Add back button
      const backBtn = document.createElement('button');
      backBtn.id = 'back-to-list';
      backBtn.className = 'content-back-button';
      backBtn.textContent = '🔙 Back to Blog List';

      blogContent.insertBefore(backBtn, blogContent.firstChild);

      container.innerHTML = blogContent.outerHTML;

      // Bind back button event
      container.querySelector('#back-to-list').addEventListener('click', () => {
        container.style.display = 'none';
        postsList.style.display = '';
        container.innerHTML = '';
      });

      // Load markdown file and parse front-matter + content
      const blogMdResp = await fetchFresh(`data/blog/${id}.md`);
      if (!blogMdResp.ok) throw new Error(`Unable to load blog ${id} (${blogMdResp.status})`);
      const blogMdText = await blogMdResp.text();

      const match = blogMdText.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
      if (!match) {
        container.querySelector('#blog-content').innerHTML = '<p>Error: Invalid blog format</p>';
        return;
      }

      const metaText = match[1];
      const markdownContent = match[2];

      const meta = {};
      metaText.split('\n').forEach(line => {
        const [key, ...rest] = line.split(':');
        meta[key.trim()] = rest.join(':').trim();
      });

      container.querySelector('#blog-title').innerText = meta.title;
      container.querySelector('#blog-meta').innerText = `${meta.category} | ${meta.date}`;

      const blogBody = container.querySelector('#blog-content');
      blogBody.innerHTML = renderMarkdown(markdownContent);
	  blogBody.classList.add('markdown-content');
      preparePdfLinks(blogBody, "data/blog/");
      highlightCodeBlocks(blogBody);

    } catch (error) {
      container.innerHTML = `<p>Error: ${error.message}</p>`;
      console.error(error);
    }
  });
});

// Portfolio处理逻辑（与Blog完全对称）
document.addEventListener('DOMContentLoaded', () => {
  const postsList = document.querySelector('.project-list');
  const container = document.getElementById('project-detail-container');

  // 相同的时间格式化函数
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // 加载项目列表
  fetchFresh('data/projects/index.json')
    .then(res => {
      if (!res.ok) throw new Error(`Unable to load project index (${res.status})`);
      return res.json();
    })
    .then(async ids => {
      const posts = await Promise.all(ids.map(async id => {
        try {
          const resp = await fetchFresh(`data/projects/${id}.md`);
          if (!resp.ok) throw new Error(`Unable to load project ${id} (${resp.status})`);
          const text = await resp.text();
          const match = text.match(/^---\n([\s\S]+?)\n---/);
          if (!match) return null;

          const meta = {};
          match[1].split('\n').forEach(line => {
            const [key, ...rest] = line.split(':');
            meta[key.trim()] = rest.join(':').trim();
          });



          return { id, ...meta };
        } catch (e) {
          console.error(`Failed to load project ${id}`, e);
          return null;
        }
      }));

      const validPosts = posts.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));

      validPosts.forEach(post => {
        const li = document.createElement('li');
        li.className = 'blog-post-item'; // 使用与blog相同的class
        li.innerHTML = `
          <a href="#" class="blog-link" data-id="${post.id}">
            <div class="blog-content">
              <div class="blog-meta">
                <p class="blog-category">${post.category}</p>
                <span class="dot"></span>
                <time datetime="${post.date}">${formatDate(post.date)}</time>
              </div>
              <h3 class="h3 blog-item-title">${post.title}</h3>
              <p class="blog-text">Click to view details...</p>
            </div>
          </a>
        `;
        postsList.appendChild(li);
      });
    })
    .catch(error => {
      console.error("Error when loading project index:", error);
      postsList.innerHTML = `<li class="content-load-error">Portfolio could not be loaded: ${error.message}</li>`;
    });

  // 点击处理（与Blog相同）
  document.body.addEventListener('click', async (event) => {
    const link = event.target.closest('.project-list [data-id]');
    if (!link || !link.classList.contains('blog-link')) return;

    event.preventDefault();
    const id = link.dataset.id;

    postsList.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = `<p>Loading project ${id}...</p>`;

    try {
      const response = await fetchFresh(`data/projects/${id}.md`);
      if (!response.ok) throw new Error(`Unable to load project ${id} (${response.status})`);
      const text = await response.text();
      const match = text.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);

      const meta = {};
      match[1].split('\n').forEach(line => {
        const [key, ...rest] = line.split(':');
        meta[key.trim()] = rest.join(':').trim();
      });

      const downloadSection = meta.codefile
        ? `
          <div class="project-download-section">
            <p class="project-download-label">
              Source file: ${meta.codefile}
            </p>

            <a
              href="data/projects/${encodeURIComponent(meta.codefile)}"
              download="${meta.codefile}"
              class="download-button"
            >
              <ion-icon name="download-outline"></ion-icon>
              <span>Download Source</span>
            </a>
          </div>
        `
        : "";

      container.innerHTML = `
        <button id="back-to-projects" class="content-back-button">
          🔙 Back to Portfolio List
        </button>

        <div class="blog-post">
          <h1>${meta.title}</h1>
          <div class="post-meta">${meta.date} • ${meta.category}</div>
          <div class="post-content markdown-content">${renderMarkdown(match[2])}</div>
          ${downloadSection}
        </div>
      `;

      // 添加返回逻辑
      document.getElementById('back-to-projects').addEventListener('click', () => {
        container.style.display = 'none';
        postsList.style.display = '';
        container.innerHTML = '';
      });
      // 代码高亮
      highlightCodeBlocks(container);

    } catch (error) {
      container.innerHTML = `<p>Error loading project: ${error.message}</p>`;
    }
  });
});

document.addEventListener("DOMContentLoaded", async function () {
  const publicationsList = document.getElementById("publications-list");

  if (!publicationsList) {
    return;
  }

  try {
    const response = await fetchFresh("data/publications.json");

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const publications = await response.json();

    publications.sort((a, b) => b.year - a.year);

    publicationsList.innerHTML = "";

function normalizeAuthorName(name) {
  return name
    .toLowerCase()
    .replace(/[.,\s-]/g, "");
}

function formatAuthors(authors) {
  const myNameVariants = [
    "J. Zhang",
    "J Zhang",
    "Zhang, J.",
    "Zhang, J",
    "Jingya Zhang",
    "Zhang, Jingya"
  ];

  const normalizedVariants = myNameVariants.map(normalizeAuthorName);

  return authors
    .map(author => {
      const isMyName = normalizedVariants.includes(
        normalizeAuthorName(author)
      );

      return isMyName ? `<strong>${author}</strong>` : author;
    })
    .join(", ");
}
    publications.forEach((publication, index) => {
      const item = document.createElement("li");
      item.className = "service-item";

	  const authorText = formatAuthors(publication.authors);

	  const volumeAndIssue = publication.volume
	    ? `${publication.volume}${publication.issue ? `(${publication.issue})` : ""}`
		:"";
	  const pagesText = publication.pages
  		? `, ${publication.pages}`
  		: "";
	  const yearText = publication.year
  		? ` (${publication.year})`
  		: "";

	  const publicationUrl = publication.doi
	    ? `https://doi.org/${publication.doi}`
		: "#";

      item.innerHTML = `
	  	<a
		  href="${publicationUrl}"
		      target="_blank"
  			  rel="noopener noreferrer"
    		  class="publication-link"
   			  title="Open publication"
  		>
        <div class="service-content-box">
          <p class="service-item-text publication-citation">
            ${index + 1}. ${authorText}. "${publication.title}" <i><strong>${publication.journal || ""}</strong></i>, ${volumeAndIssue}${pagesText}${yearText}.
          </p>
        </div>
		</a>
      `;

      publicationsList.appendChild(item);
    });

    if (publications.length === 0) {
      publicationsList.innerHTML = `
        <li class="service-item">
          <div class="service-content-box">
            <p class="service-item-text">
              No publications yet.
            </p>
          </div>
        </li>
      `;
    }
  } catch (error) {
    console.error("Failed to load publications:", error);

    publicationsList.innerHTML = `
      <li class="service-item">
        <div class="service-content-box">
          <p class="service-item-text">
            Publications could not be loaded.
          </p>
        </div>
      </li>
    `;
  }
});

// Encrypted gallery. The plaintext source never ships with the website.
document.addEventListener("DOMContentLoaded", () => {
  const gate = document.getElementById("gallery-gate");
  const galleryContent = document.getElementById("gallery-content");
  const passwordForm = document.getElementById("gallery-password-form");
  const passwordInput = document.getElementById("gallery-password");
  const passwordError = document.getElementById("gallery-password-error");
  const postsList = document.querySelector(".gallery-posts-list");
  const detailContainer = document.getElementById("gallery-detail-container");

  if (!gate || !galleryContent || !passwordForm || !postsList || !detailContainer) return;

  let galleryFiles = null;
  const galleryAssetUrls = new Map();

  const decodeBase64 = value => {
    const binary = atob(value);
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  };

  const readGalleryText = path => {
    const file = galleryFiles?.[path];
    if (!file) throw new Error(`Missing encrypted file: ${path}`);
    return new TextDecoder().decode(decodeBase64(file.data));
  };

  const normalizeGalleryPath = path => path.replace(/^\.\//, "");

  const resolveGalleryAsset = path => {
    const normalizedPath = normalizeGalleryPath(path);
    const file = galleryFiles?.[normalizedPath];
    if (!file) return path;

    if (!galleryAssetUrls.has(normalizedPath)) {
      const blob = new Blob([decodeBase64(file.data)], { type: file.mime || "application/octet-stream" });
      galleryAssetUrls.set(normalizedPath, URL.createObjectURL(blob));
    }

    return galleryAssetUrls.get(normalizedPath);
  };

  const decryptGallery = async password => {
    const response = await fetchFresh("data/gallery.enc.json");
    if (!response.ok) {
      if (response.status === 404) throw new Error("Encrypted Gallery has not been generated yet.");
      throw new Error(`Unable to load encrypted Gallery (${response.status}).`);
    }

    const bundle = await response.json();
    if (bundle.version !== 1 || bundle.kdf !== "PBKDF2-SHA256" || bundle.cipher !== "AES-256-GCM") {
      throw new Error("Unsupported encrypted Gallery format.");
    }

    const passwordKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    const decryptionKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt: decodeBase64(bundle.salt),
        iterations: bundle.iterations
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: decodeBase64(bundle.iv) },
      decryptionKey,
      decodeBase64(bundle.ciphertext)
    );

    const payload = JSON.parse(new TextDecoder().decode(plaintext));
    if (payload.version !== 1 || !payload.files) throw new Error("Invalid decrypted Gallery data.");
    galleryFiles = payload.files;
  };

  const parseFrontMatter = textValue => {
    const match = textValue.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
    if (!match) return null;

    const meta = {};
    match[1].split("\n").forEach(line => {
      const [key, ...rest] = line.split(":");
      meta[key.trim()] = rest.join(":").trim();
    });

    return { meta, content: match[2] };
  };

  const formatGalleryDate = dateValue => new Date(dateValue).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const unlockGallery = () => {
    const ids = JSON.parse(readGalleryText("index.json"));
    const entries = ids.map(id => {
      const parsed = parseFrontMatter(readGalleryText(`${id}.md`));
      return parsed ? { id, ...parsed.meta } : null;
    });

    postsList.innerHTML = "";
    entries
      .filter(Boolean)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach(entry => {
        const item = document.createElement("li");
        item.className = "blog-post-item";
        item.innerHTML = `
          <a href="#" class="gallery-link" data-gallery-id="${entry.id}">
            ${entry.image ? `
              <figure class="blog-banner-box">
                <img src="${resolveGalleryAsset(entry.image)}" alt="${entry.title}" loading="lazy">
              </figure>
            ` : ""}
            <div class="blog-content">
              <div class="blog-meta">
                <p class="blog-category">${entry.category || "Gallery"}</p>
                <span class="dot"></span>
                <time datetime="${entry.date}">${formatGalleryDate(entry.date)}</time>
              </div>
              <h3 class="h3 blog-item-title">${entry.title}</h3>
              <p class="blog-text">Click to view...</p>
            </div>
          </a>
        `;
        postsList.appendChild(item);
      });

    gate.hidden = true;
    galleryContent.hidden = false;
  };

  passwordForm.addEventListener("submit", async event => {
    event.preventDefault();
    passwordError.textContent = "";

    const submitButton = passwordForm.querySelector("button[type='submit']");
    submitButton.disabled = true;

    try {
      await decryptGallery(passwordInput.value);
      passwordInput.value = "";
      unlockGallery();
    } catch (error) {
      console.error("Gallery decryption failed:", error);
      passwordError.textContent = error.name === "OperationError"
        ? "Incorrect password."
        : error.message;
      passwordInput.select();
    } finally {
      submitButton.disabled = false;
    }
  });

  postsList.addEventListener("click", async event => {
    const link = event.target.closest("[data-gallery-id]");
    if (!link) return;
    event.preventDefault();

    const id = link.dataset.galleryId;
    postsList.style.display = "none";
    detailContainer.style.display = "block";
    detailContainer.innerHTML = "<p>Loading gallery entry...</p>";

    try {
      const parsed = parseFrontMatter(readGalleryText(`${id}.md`));
      if (!parsed) throw new Error("Invalid gallery entry format");

      const resolvedMarkdown = parsed.content.replace(
        /(!\[[^\]]*\]\()([^)]+)(\))/g,
        (match, prefix, path, suffix) => `${prefix}${resolveGalleryAsset(path)}${suffix}`
      );

      detailContainer.innerHTML = `
        <button id="back-to-gallery" class="content-back-button">🔙 Back to Gallery</button>
        <div class="gallery-detail">
          <h1>${parsed.meta.title}</h1>
          <div class="post-meta">${parsed.meta.date} • ${parsed.meta.category || "Gallery"}</div>
          <div class="markdown-content">${renderMarkdown(resolvedMarkdown)}</div>
        </div>
      `;

      highlightCodeBlocks(detailContainer);

      detailContainer.querySelector("#back-to-gallery").addEventListener("click", () => {
        detailContainer.style.display = "none";
        detailContainer.innerHTML = "";
        postsList.style.display = "";
      });
    } catch (error) {
      detailContainer.innerHTML = `<p>Gallery entry could not be loaded: ${error.message}</p>`;
    }
  });
});
