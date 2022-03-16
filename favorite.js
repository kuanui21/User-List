const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const USERS_PER_PAGE = 18;

const users = JSON.parse(localStorage.getItem('favorite')) || []
let filterUsers = [];

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");

// 渲染朋友清單
function renderUserList(data) {
  let rawHTML = "";

  data.forEach((item) => {
    rawHTML += `<div class="col-sm-2">
    <div class="mb-3 shadow-sm bg-body rounded">
      <div class="card">
        <img src="${item.avatar}" class="card-img-top" alt="User Photo">
        <div class="card-body">
          <h5 class="card-title">${item.name}</h5>
        </div>
        <div class="d-grid">
          <button class="btn btn-secondary btn-show-user" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">more</button>
          <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
         </div>
        </div>
      </div>
    </div>`;
  });

  dataPanel.innerHTML = rawHTML;
}

// 渲染分頁器
function renderPaginator(amount) {
  const NumberOfPage = Math.ceil(amount / USERS_PER_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= NumberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function getUsersByPage(page) {
  const data = filterUsers.length ? filterUsers : users;
  const starIndex = (page - 1) * USERS_PER_PAGE;

  return data.slice(starIndex, starIndex + USERS_PER_PAGE);
}

// 顯示朋友資料
function showUserModal(id) {
  const userModalTitle = document.querySelector("#user-modal-title");
  const userModalBody = document.querySelector("#user-modal-body");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data;
    let rawHTML = `<div class="row">
            <div class="col-sm-5 userPhoto">
              <img src="${data.avatar}" alt="User photo">
            </div>
            <div class="col-sm-7">
              <p class="email"><i class="fas fa-envelope"></i>email: ${data.email}</p>
              <p class="gender"><i class="fas fa-venus-mars"></i>gender: ${data.gender}</p>
              <p class="birthday"><i class="fas fa-birthday-cake"></i>birthday: ${data.birthday}</p>
              <p class="age"><i class="fas fa-pager"></i>age: ${data.age}</p>
              <p class="region"><i class="fas fa-map-marker-alt"></i>region: ${data.region}</p>
            </div>
          </div>`;

    userModalTitle.innerText = data.name + " " + data.surname;
    userModalBody.innerHTML = rawHTML;
  });
}

// 從喜愛清單移除
function removeFromFavorite(id) {
  id = Number(id)

  const userIndex = users.findIndex((user) => user.id === id)
  users.splice(userIndex, 1)

  localStorage.setItem('favorite', JSON.stringify(users))

  // 第一個資料的index為 0 會無法顯示資料，故加一
  const nowOfPage = Math.ceil((userIndex + 1) / USERS_PER_PAGE);
  renderPaginator(users.length)
  renderUserList(getUsersByPage(nowOfPage))
}

// 內容的監聽器，點more按鈕/點+按鈕
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-user")) {
    showUserModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(event.target.dataset.id);
  }
});

// 分頁器的監聽器，點頁碼，跑函式"抓取該頁的朋友清單"
paginator.addEventListener("click", function onPaginationClicked(event) {
  if (event.target.tagName !== "A") return;

  const page = Number(event.target.dataset.page);
  renderUserList(getUsersByPage(page));
});

// 搜尋表單的監聽器
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();

  let keyword = searchInput.value.trim().toLowerCase();
  filterUsers = users.filter((user) =>
    user.name.toLowerCase().includes(keyword)
  );

  if (filterUsers.length === 0) {
    return alert(`找不到符合${keyword}的資料`);
  }
  renderPaginator(filterUsers.length)
  renderUserList(getUsersByPage(1));
});

renderPaginator(users.length)
renderUserList(getUsersByPage(1));
