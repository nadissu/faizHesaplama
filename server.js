const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware with CSP configured for AdSense
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://pagead2.googlesyndication.com", "https://www.googletagservices.com", "https://adservice.google.com", "https://www.google-analytics.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "https://pagead2.googlesyndication.com"],
            frameSrc: ["https://googleads.g.doubleclick.net", "https://www.google.com", "https://tpc.googlesyndication.com"],
            connectSrc: ["'self'", "https://pagead2.googlesyndication.com", "https://www.google-analytics.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Compression
app.use(compression());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Kredi Kartı Faiz Hesaplama | Ücretsiz Online Borç Hesaplama Aracı 2026',
        description: 'Kredi kartı borcunuzu ne kadar sürede ödeyeceğinizi, toplam faiz maliyetinizi ve aylık ödeme planınızı ücretsiz hesaplayın. Asgari ödeme, sabit ödeme ve taksit hesaplama.',
        keywords: 'kredi kartı faiz hesaplama, borç hesaplama, asgari ödeme hesaplama, kredi kartı taksit hesaplama, faiz oranı hesaplama'
    });
});

// ads.txt route
app.get('/ads.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ads.txt'));
});

// robots.txt route
app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// sitemap route
app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('index', {
        title: 'Sayfa Bulunamadı | Kredi Kartı Faiz Hesaplama',
        description: 'Aradığınız sayfa bulunamadı.',
        keywords: ''
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
