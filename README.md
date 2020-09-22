# styled-youtube-embedding-labwork

> Embed YouTube video in a webpage with a custom play-button, original poster at the best resolution and responsive container, keeping aspect ratio.

[Try it](https://chiefred.github.io/styled-youtube-embedding-labwork/) in action!

Often we need to embed a YouTube video in a custom design (with a custom play button), but for that purpose, we only have the URL of that video. Let`s disassemble the task in several steps.

## Get \<id-of-video\> from URL

YouTube video URLs can be provided in several formats, like:

- https://youtu.be/jIHvgUAW5vE
- https://youtu.be/jIHvgUAW5vE?t=2
- https://www.youtube.com/embed/jIHvgUAW5vE
- https://www.youtube.com/watch?v=jIHvgUAW5vE&ab_channel=MihaEr%C5%BEen

In all the examples presented, the desired video identifier will be `jIHvgUAW5vE`. So, we need a way to extract it.

In most cases, we will do this on the server side by regular expression and even in combination with check: if we have a valid YouTube video URL (of any format), then we can, for example, insert its poster image into the page.

I will use PHP:

```php
<? if (
    preg_match(
        '/[\/\=]{1}([a-zA-Z0-9_-]{11})([\?\&]{1}|$)/',
        $anyYouTubeVideoURL,
        $matches
    )
): ?>
    <img
      src="https://img.youtube.com/vi/<?=$matches[1]?>/maxresdefault.jpg"
      alt="video"
    />
<? endif ?>
```

## Get the poster image for YouTube video

As already shown above, poster image can be loaded from `img.youtube.com`. Best resolution images available at URLs like:

```html
https://img.youtube.com/vi/<id-of-video>/maxresdefault.jpg</id-of-video>
```

But in some cases they may not exist (when the original video was in low resolution).

We can find the following variations of the image file names used:

- maxresdefault
- mqdefault
- sddefault
- hqdefault
- default

And we need to determine if the image exists or not. With the 404 error response, YouTube also transmits a default placeholder image, which prevents the `img` tag's `onerror` event handler from being called. Thus, we can only check the "natural dimensions" of the resulting image.

The idea is to try to load the highest resolution image (`maxresdefault.jpg`) and test the result with onload script:

```html
<img
  src="https://img.youtube.com/vi/<id-of-video>/maxresdefault.jpg"
  onload="window.youtube_img_load_check(this)"
  alt="video"
/>
```

But before the `img` tag, we must register the `youtube_img_load_check` function in the `head` section of the web page:

```js
window.youtube_img_load_check = function (e) {
  var thumbnail = [
    "maxresdefault",
    "mqdefault",
    "sddefault",
    "hqdefault",
    "default",
  ];
  var url = e.getAttribute("src");
  if (e.naturalWidth === 120 && e.naturalHeight === 90) {
    for (var i = 0, len = thumbnail.length - 1; i < len; i++) {
      if (url.indexOf(thumbnail[i]) > 0) {
        e.setAttribute("src", url.replace(thumbnail[i], thumbnail[i + 1]));
        break;
      }
    }
  }
};
```

If loading `maxresdefault.jpg` fails, the script will try the next option from the array. Etc.

The default YouTube stub image size is 120 x 90 pixels. Thus, we can detect errors when checking the `naturalWidth` and `naturalHeight` of the resulting image.

## Preserve the aspect ratio of the poster image in a responsive design

The YouTube documentation says, "The standard aspect ratio for YouTube on a computer is 16:9". And most videos are in this format.
As I found, even videos with a 4:3 aspect ratio in most cases have a poster in 16:9 format, until `default.jpg` which 120x90 (same as 404 error image).

Thus, we cannot determine the aspect ratio of the video when measuring the loaded poster. That's why I just think all YouTube videos in 16:9 format. The result for my cases is acceptable. Here is the layout.

HTML:

```html
<div class="youtube-video">
  <div class="youtube-video__aspect">
    <div class="youtube-video__wrapper">
      <img
        class="youtube-video__poster"
        src="https://img.youtube.com/vi/<id-of-video>/maxresdefault.jpg"
        onload="window.youtube_img_load_check(this)"
        alt="video"
        loading="lazy"
      />
      <div
        class="youtube-video__play-icon"
        data-link="https://www.youtube.com/embed/<id-of-video>"
      ></div>
    </div>
  </div>
</div>
```

CSS:

```css
.youtube-video {
  width: 100%;
}

.youtube-video__aspect {
  width: 100%;
  height: 0;
  position: relative;
  padding-top: 56.25%; /* This line gives 16:9 aspect ratio */
}

.youtube-video__poster {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.youtube-video__wrapper {
  /* Needed to properly resize video */
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.youtube-video__play-icon {
  ...;
}

.youtube-video__iframe {
  /* Needed to properly resize video */
  width: 100%;
  height: 100%;
}
```

## Launch YouTube video player

One final piece of the puzzle - we need to replace the poster image with a real YouTube player when the user hits the play button. This JS can be placed at the bottom of the page.

```js
const videos = document.querySelectorAll(
  ".youtube-video .youtube-video__play-icon"
);
videos.forEach(function (video) {
  video.addEventListener("click", function (e) {
    const link = e.target.dataset.link || null;
    const parent = e.target.closest(".youtube-video__wrapper");
    if (link && parent) {
      parent.classList.add("loading");
      parent.innerHTML =
        '<iframe class="youtube-video__iframe" src="' +
        link +
        '?autoplay=1" frameborder="0" allowfullscreen' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"' +
        "></iframe>";
    }
  });
});
```
You can optionally use the `.youtube-video__wrapper.loading` CSS selector to show the loading indicator.

Now [try it](https://chiefred.github.io/styled-youtube-embedding-labwork/) in action!