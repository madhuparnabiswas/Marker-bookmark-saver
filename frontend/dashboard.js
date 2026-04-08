const open_modal = document.getElementById('open_modal');
const modal_container = document.getElementById('modal_container');
const close_modal = document.getElementById('close_modal');

open_modal.addEventListener('click', () => {
  modal_container.classList.add('show');
});

modal_container.addEventListener('click', (e) => {
  if (e.target === modal_container) {
    modal_container.classList.remove('show');
  } 
});
console.log("JS is working");

let titleInput = document.getElementById('title');
let urlInput = document.getElementById('url');

let deleteIndex = null;

function checkInputs() {
  let title = titleInput.value.trim();
  let url = urlInput.value.trim();

  close_modal.disabled = !(title && url);
}

titleInput.addEventListener("input", checkInputs);
urlInput.addEventListener("input", checkInputs); 

close_modal.addEventListener('click', () => {

  console.log("Add button clicked");  // debug 
  let title = titleInput.value.trim();
  let url = urlInput.value.trim();


  if (!url.startsWith("http")) {
      url = "https://" + url;
  }

  console.log("Sending:", { title, url }); // debug

  const bookmark = { title, url };

  fetch('http://localhost:5000/bookmarks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, url })
  })
   .then(res => {
    console.log("Response received"); // debug
    return res.json();
  })
  .then(() => fetchBookmarks());
  
  titleInput.value = "";
  urlInput.value = "";
  close_modal.disabled=true;

  modal_container.classList.remove('show');
})

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

const noData = document.getElementById('no_data');

function renderCards(bookmarks)
{
  const container = document.getElementById("bookmark-list");
  container.innerHTML="";

  if (bookmarks.length === 0) {
    noData.style.display = 'block';
    return;
  }

  noData.style.display = 'none';

  bookmarks.forEach((b, index) => {
    const card = document.createElement("div");
    card.classList.add("bookmark-card");

    card.innerHTML=`<div class="card-header">
                        <p class="card-title">${b.title}</p>
                        <div class="card-logo">
                          <img src="https://www.google.com/s2/favicons?sz=64&domain=${getDomain(b.url)}" />
                        </div>
                      </div>

                      <div class="card-footer">

                        <div>
                          <p>${new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <div class="menu-container">
                        <button class="menu-btn">⋮</button>

                        <div class="menu">
                          <p class="edit-btn" data-index="${index}">Edit</p>
                          <p class="delete-btn" data-id="${b._id}">Delete</p>
                        </div>
                      </div>

                      </div>`;
    
  card.addEventListener("click", (e) => {
    if (!e.target.closest(".menu-container")) {
      window.open(b.url, "_blank");
    }
  });

  container.appendChild(card);
  });
}

//open delete modal
document.getElementById("bookmark-list").addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
  deleteIndex = e.target.getAttribute("data-id");
  document.getElementById("confirm-modal").classList.add("show");
}
  }
);

//cancel button delete modal
document.getElementById("cancel-delete").addEventListener("click", () => {
  deleteIndex = null;
  document.getElementById("confirm-modal").classList.remove("show");
});


// delete fuction
document.getElementById("confirm-delete").addEventListener("click", () => {
  fetch(`http://localhost:5000/bookmarks/${deleteIndex}`, {
    method: 'DELETE'
  })
  .then(() => {
    deleteIndex = null;
    document.getElementById("confirm-modal").classList.remove("show");
    fetchBookmarks();
  });
});

//3-dot menu
document.getElementById("bookmark-list").addEventListener("click", (e) => {
  if (e.target.classList.contains("menu-btn")) {
    e.stopPropagation(); 

    const menu = e.target.nextElementSibling;

    document.querySelectorAll(".menu").forEach(m => m.classList.remove("show"));

    menu.classList.toggle("show");
  }
});

//close modal outside click
document.getElementById("confirm-modal").addEventListener("click", (e) => {
  if (e.target.id === "confirm-modal") {
    document.getElementById("confirm-modal").classList.remove("show");
  }
});

function fetchBookmarks() {
  fetch('http://localhost:5000/bookmarks')
    .then(res => res.json())
    .then(data => renderCards(data));
}

fetchBookmarks();

document.addEventListener("click", (e) => {
  const allMenus = document.querySelectorAll(".menu");

  allMenus.forEach((menu) => {
    if (!menu.parentElement.contains(e.target)) {
      menu.classList.remove("show");
    }
  });
});
