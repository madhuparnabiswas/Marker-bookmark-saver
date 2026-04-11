const API_BASE = 'http://localhost:5000';

const open_modal = document.getElementById('open_modal');
const modal_container = document.getElementById('modal_container');
const close_modal = document.getElementById('close_modal');

open_modal.addEventListener('click', () => {
  modal_container.classList.add('show');
});

modal_container.addEventListener('click', (e) => {
  if (e.target === modal_container) {
    titleInput.value = '';
    urlInput.value = '';
    close_modal.disabled = true;
    editId = null;
    document.getElementById('modal-title').textContent = 'New Bookmark';
    modal_container.classList.remove('show');
  }
});

let titleInput = document.getElementById('title');
let urlInput = document.getElementById('url');

let deleteId = null;
let editId = null;
const bookmarkData = new Map(); // stores { title, url } keyed by id

// --- Helpers ---

function escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function checkInputs() {
  const title = titleInput.value.trim();
  const url = urlInput.value.trim();
  close_modal.disabled = !(title && url);
}

titleInput.addEventListener('input', checkInputs);
urlInput.addEventListener('input', checkInputs);

// --- Add Bookmark ---

close_modal.addEventListener('click', () => {
  let title = titleInput.value.trim();
  let url = urlInput.value.trim();

  // Robust URL validation
  try {
    const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
    url = parsed.href;
  } catch {
    alert('Please enter a valid URL');
    return;
  }

  const isEditing = editId !== null;
  const endpoint = isEditing ? `${API_BASE}/bookmarks/${editId}` : `${API_BASE}/bookmarks`;
  const method = isEditing ? 'PUT' : 'POST';

  console.log('sending:', { title, url, editId });
  fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, url })
  })
    .then(res => {
      if (!res.ok) throw new Error('Server error: ' + res.status);
      return res.text();
    })
    .then(() => {
      titleInput.value = '';
      urlInput.value = '';
      close_modal.disabled = true;
      editId = null;
      document.getElementById('modal-title').textContent = 'New Bookmark';
      modal_container.classList.remove('show');
      
      fetchBookmarks();
    })
    .catch(err => {
      console.error('Failed to save bookmark:', err);
      alert('Failed to save bookmark. Please try again.');
    });
});

// --- Render Cards ---

const noData = document.getElementById('no_data');

function renderCards(bookmarks) {
  const container = document.getElementById('bookmark-list');
  container.innerHTML = '';

  if (bookmarks.length === 0) {
    noData.style.display = 'block';
    return;
  }

  noData.style.display = 'none';

  bookmarks.forEach((b) => {
    const card = document.createElement('div');
    card.classList.add('bookmark-card');

    bookmarkData.set(b._id, { title: b.title, url: b.url });

    const dateStr = b.createdAt
      ? new Date(b.createdAt).toLocaleDateString()
      : new Date().toLocaleDateString();

    card.innerHTML = `
      <div class="card-header">
        <p class="card-title">${escape(b.title)}</p>
        <div class="card-logo">
          <img src="https://www.google.com/s2/favicons?sz=64&domain=${escape(getDomain(b.url))}" />
        </div>
      </div>

      <div class="card-footer">
        <div>
          <p>${dateStr}</p>
        </div>

        <div class="menu-container">
          <button class="menu-btn">⋮</button>
          <div class="menu">
            <p class="edit-btn" data-id="${escape(b._id)}">Edit</p>
            <p class="delete-btn" data-id="${escape(b._id)}">Delete</p>
          </div>
        </div>
      </div>`;

    card.addEventListener('click', (e) => {
      if (!e.target.closest('.menu-container')) {
        window.open(b.url, '_blank');
      }
    });

    container.appendChild(card);
  });
}

// --- Edit Modal ---

document.getElementById('bookmark-list').addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-btn')) {
    const id = e.target.getAttribute('data-id');
    const data = bookmarkData.get(id);
    if (!data) return;

    editId = id;
    titleInput.value = data.title;
    urlInput.value = data.url;
    close_modal.disabled = false;
    document.getElementById('modal-title').textContent = 'Edit Bookmark';
    document.querySelectorAll('.menu').forEach(m => m.classList.remove('show'));
    modal_container.classList.add('show');
  }
});

// --- Delete Modal ---

document.getElementById('bookmark-list').addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    deleteId = e.target.getAttribute('data-id');
    document.getElementById('confirm-modal').classList.add('show');
  }
});

document.getElementById('cancel-delete').addEventListener('click', () => {
  deleteId = null;
  document.getElementById('confirm-modal').classList.remove('show');
});

document.getElementById('confirm-delete').addEventListener('click', () => {
  fetch(`${API_BASE}/bookmarks/${deleteId}`, {
    method: 'DELETE'
  })
    .then(res => {
      if (!res.ok) throw new Error('Server error: ' + res.status);
      return res.json();
    })
    .then(() => {
      deleteId = null;
      document.getElementById('confirm-modal').classList.remove('show');
      fetchBookmarks();
    })
    .catch(err => {
      console.error('Failed to delete bookmark:', err);
      alert('Failed to delete bookmark. Please try again.');
    });
});

// --- 3-dot Menu ---

document.getElementById('bookmark-list').addEventListener('click', (e) => {
  if (e.target.classList.contains('menu-btn')) {

    e.stopPropagation();

    const menu = e.target.nextElementSibling;
    const card = e.target.closest('.bookmark-card');

    document.querySelectorAll('.menu').forEach(m => m.classList.remove('show'));
    document.querySelectorAll('.bookmark-card').forEach(c => c.classList.remove('selected'));

    menu.classList.toggle('show');

    if (menu.classList.contains("show")) {
      card.classList.add("selected");
    }
  }
});

// Close confirm modal on outside click
document.addEventListener("click", () => {
  document.querySelectorAll(".menu").forEach(menu => {
    menu.classList.remove("show");
  });

  document.querySelectorAll(".bookmark-card").forEach(card => {
    card.classList.remove("selected");
  });
});

// Close menus on outside click
document.addEventListener('click', (e) => {
  document.querySelectorAll('.menu').forEach((menu) => {
    if (!menu.parentElement.contains(e.target)) {
      menu.classList.remove('show');
    }
  });
});

// --- Fetch Bookmarks ---

function fetchBookmarks() {
  fetch(`${API_BASE}/bookmarks`)
    .then(res => {
      if (!res.ok) throw new Error('Server error: ' + res.status);
      return res.json();
    })
    .then(data => renderCards(data))
    .catch(err => {
      console.error('Failed to fetch bookmarks:', err);
      alert('Could not load bookmarks. Is the server running?');
    });
}

fetchBookmarks();