(() => {
    document.addEventListener("DOMContentLoaded",
        () => {
            var img_elements = document.querySelectorAll("article img");
            img_elements.forEach(img_element => {
                var link_element = document.createElement("a");
                link_element.setAttribute("href", img_element.getAttribute("src"))
                link_element.classList.add("image-link");

                img_element.parentNode.insertBefore(link_element, img_element);
                link_element.appendChild(img_element);
            });
        }
    )
})()