window.onload = () => {
    const phoneSelect = document.getElementById("phoneSelect");
    const fovDiv = document.getElementById("fovDiv");
    const fovSlider = document.getElementById("fovSlider");

    let fov = 90;

    phoneSelect.addEventListener("change", (event) => {
        const newValue = Number(event.target.value);

        if (newValue < 0) {
            fovDiv.hidden = false;
            fov = Number(fovSlider.value);
            window.localStorage.setItem("fov", fov);
        } else {
            fovDiv.hidden = true;
            fov = newValue;
            window.localStorage.setItem("fov", fov);
        }

        console.log(fov);
    });

    fovSlider.addEventListener("change", (event) => {
        fov = Number(event.target.value);
        window.localStorage.setItem("fov", fov);
        console.log(fov);
    });
};