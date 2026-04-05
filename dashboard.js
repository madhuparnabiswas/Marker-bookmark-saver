const open_modal = document.getElementById('open_modal');
const modal_container = document.getElementById('modal_container');
const close_modal = document.getElementById('close_modal');

open_modal.addEventListener('click', () => {
  modal_container.classList.add('show');
});
/*close_modal.addEventListener('click', () => {
  modal_container.classList.remove('show');
});*/
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
  let title = titleInput.value.trim();
  let url = urlInput.value.trim();


  if (!url.startsWith("http")) {
      url = "https://" + url;
  }

  const bookmark = { title, url };

  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

  bookmarks.push(bookmark);
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

  console.log("Saved:", bookmarks);
  
  titleInput.value = "";
  urlInput.value = "";
  close_modal.disabled=true;

  modal_container.classList.remove('show');

  renderCards();
})

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function renderCards()
{
  const container = document.getElementById("bookmark-list");
  container.innerHTML="";

  const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];



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
                          <p class="delete-btn" data-index="${index}">Delete</p>
                        </div>
                      </div>

                      </div>`;
    
  card.addEventListener("click", (e) => {
    if (!e.target.closest(".menu-container")) {
      window.open(b.url, "_blank");
    }
  });

  /*const menuBtn = document.getElementById("menuBtn");
  menuBtn.addEventListener('click', () => {
    const menu = document.getElementById("")
  });*/

  container.appendChild(card);
  });
}

//open delete modal
document.getElementById("bookmark-list").addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    deleteIndex = e.target.getAttribute("data-index");

    document.getElementById("confirm-modal").classList.add("show");
  }
});

//cancel button delete modal
document.getElementById("cancel-delete").addEventListener("click", () => {
  deleteIndex = null;
  document.getElementById("confirm-modal").classList.remove("show");
});


// delete fuction
document.getElementById("confirm-delete").addEventListener("click", () => {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

  if (deleteIndex !== null) {
    bookmarks.splice(deleteIndex, 1);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }

  deleteIndex = null;

  document.getElementById("confirm-modal").classList.remove("show");

  renderCards();
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

renderCards();

document.addEventListener("click", (e) => {
  const allMenus = document.querySelectorAll(".menu");

  allMenus.forEach((menu) => {
    if (!menu.parentElement.contains(e.target)) {
      menu.classList.remove("show");
    }
  });
});
