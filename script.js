const API_URL = "https://inai-col1.fishrungames.com/ads";

const adsContainer = document.getElementById("ads");
const form = document.getElementById("adForm");
const message = document.getElementById("message");
const refreshButton = document.getElementById("refreshButton");

async function getAds() {
    adsContainer.innerHTML = '<p class="loading">Загрузка объявлений...</p>';

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`GET error: ${response.status}`);
        }

        const data = await response.json();
        displayAds(data.items || []);
    } catch (error) {
        console.error(error);
        adsContainer.innerHTML =
            '<p class="error">Не удалось загрузить объявления. Попробуйте обновить страницу.</p>';
    }
}

function displayAds(ads) {
    if (ads.length === 0) {
        adsContainer.innerHTML = '<p class="empty">Объявлений пока нет.</p>';
        return;
    }

    adsContainer.innerHTML = "";

    ads.forEach((ad) => {
        const card = document.createElement("article");
        card.className = "ad-card";

        if (ad.image_url) {
            const image = document.createElement("img");
            image.className = "ad-image";
            image.src = API_URL.replace("/ads", "") + ad.image_url;
            image.alt = ad.title || "Изображение объявления";
            image.onerror = () => {
                image.replaceWith(createNoImage());
            };
            card.appendChild(image);
        } else {
            card.appendChild(createNoImage());
        }

        const content = document.createElement("div");
        content.className = "ad-content";

        const title = document.createElement("h3");
        title.textContent = ad.title;

        const description = document.createElement("p");
        description.className = "description";
        description.textContent = ad.description;

        const price = document.createElement("div");
        price.className = "price";
        price.textContent = `${Number(ad.price).toLocaleString("ru-RU")} сом`;

        content.append(title, description, price);
        card.appendChild(content);
        adsContainer.appendChild(card);
    });
}

function createNoImage() {
    const block = document.createElement("div");
    block.className = "no-image";
    block.textContent = "Нет изображения";
    return block;
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const price = document.getElementById("price").value;
    const image = document.getElementById("image").files[0];

    if (!image) {
        message.textContent = "Выберите изображение.";
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("image", image);

    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    message.textContent = "Публикация...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`POST error: ${response.status} ${errorText}`);
        }

        const newAd = await response.json();
        console.log("Добавлено:", newAd);

        message.textContent = "Объявление успешно добавлено!";
        form.reset();

        await getAds();
    } catch (error) {
        console.error(error);
        message.textContent =
            "Не удалось добавить объявление. Проверьте данные и API.";
    } finally {
        submitButton.disabled = false;
    }
});

refreshButton.addEventListener("click", getAds);

getAds();
