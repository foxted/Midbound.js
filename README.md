# Midbound Tracker

Web tracker script to track visitors on client websites.

## Universal Snippet

This snippet will work on every browser that Midbound supports. (cf. Browser Support). 
**This is the most recommended method.**

```
<script>
    (function (m, i, d, w, a, y, s) {
        m['MidboundObject'] = a;
        m[a] = m[a] || function () { (m[a].q = m[a].q || []).push(arguments) }, m[a].l = 1 * new Date();
        y = i.createElement(d), s = i.getElementsByTagName(d)[0];
        y.async = 1;
        y.src = w;
        s.parentNode.insertBefore(y, s);
    })(window, document, 'script', 'midbound.js', 'mb');

    mb('create', 'UA-XXXXX-Y', 'auto');
    mb('send', 'pageview');
</script>
```

## Modern Browser Snippet

This snippet will improve loading times on modern browsers, but will fall back 
to a synchronous loading on older browsers that do not support the `async` attribute.

```
<script>
    window.mb = window.mb || function(){ (mb.q = mb.q || []).push(arguments) }, mb.l =+ new Date;
    mb('create', 'UA-XXXXX-Y', 'auto');
    mb('send', 'pageview');
</script>
<script async src='../../build/midbound.js'></script>
```

## Browser Support

| Chrome | Firefox | Safari | IE | Opera |
|--------|---------|--------|----|-------|
| 5 | 4.0 | 5 | 9 | 10.5 |