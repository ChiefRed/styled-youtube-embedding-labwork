(function (document, window) {
    document.addEventListener("DOMContentLoaded", function (event) {
        const videos = document.querySelectorAll('.youtube-video .youtube-video__play-icon')
        videos.forEach(function (video) {
            video.addEventListener("click", function (e) {
                const link = e.target.dataset.link || null;
                const parent = e.target.closest('.youtube-video__wrapper');
                if (link && parent) {
                    parent.classList.add('loading');
                    parent.innerHTML = '<iframe class="youtube-video__iframe" src="' + link + '?autoplay=1" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>';
                }
            });
        })
    });
}(document, window))