# Midbound Tracker

Web tracker script to track visitors on client websites.

## Universal Snippet

This snippet will work on every browser that Midbound supports. (cf. Browser Support). 
**This is the most recommended method.**

```
<script>
    (function (h, i, q, u, o, t, a) {
        h['Midbound'] = o;
        h[o] = h[o] || function () {
            (h[o].q = h[o].q || []).push(arguments)
        }, h[o].l = 1 * new Date();
        t = i.createElement(q), a = i.getElementsByTagName(q)[0];
        t.async = 1;
        t.src = u;
        a.parentNode.insertBefore(t, a);
    })(window, document, 'script', '../build/midbound.js', 'mb');
    
    mb('create', 'MB-XXXXXXXX-1', 'auto');
    mb('send', 'pageview');
</script>
```

## Modern Browser Snippet

This snippet will improve loading times on modern browsers, but will fall back 
to a synchronous loading on older browsers that do not support the `async` attribute.

```
<script>
    window.mb = window.mb || function(){ (mb.q = mb.q || []).push(arguments) };
    mb('create', 'UA-XXXXX-Y', 'auto');
    mb('send', 'pageview');
</script>
<script async src='../../build/midbound.js'></script>
```

## Browser Support

| Chrome | Firefox | Safari | IE | Opera |
|--------|---------|--------|----|-------|
| 5 | 4.0 | 5 | 9 | 10.5 |