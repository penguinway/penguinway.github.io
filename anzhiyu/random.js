var posts=["posts/53360.html","posts/62818.html","posts/15605.html","posts/12234.html","posts/61032.html","posts/7291.html","posts/16107.html","posts/1997.html","posts/63069.html","posts/435.html"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };