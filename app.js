const express = require('express');
const app = express();
const port = 3000;

const expressLayouts = require('express-ejs-layouts');
const {loadContact, findContact, addContact, cekDuplikat} = require('./utils/contacts');
const { body, validationResult, check} = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

// konfigurasi flash 
app.use(cookieParser('session'));
app.use(session({
    cookie : {maxAge : 6000},
    secret : 'secret',
    resave : true,
    saveUninitialized : true
}));

app.use(flash());

// gunakan ejs
app.set('view engine', 'ejs');

// gunakan express-ejs-layout
app.use(expressLayouts);

// Built-in middleware
app.use(express.static('public'));

app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) =>{
    // res.send('Hello World');
    // res.sendFile('./index.html', { root: __dirname });
    const data = [{
        nama: "Muhammad Mayudin",
        email: "muhammadmayudin12@gmail.com"
    },
    {
        nama: "Mayudin",
        email: "mayudin12@gmail.com"
    },
    {
        nama: "ghodel",
        email: "ghodelchibar@gmail.com"
    }];

    res.render('index', {
        layout: 'layout/main-layouts',
        title: "Halaman Index",
        data,
    });
});

app.get('/about', (req, res) =>{
    // res.sendFile('./about.html', { root: __dirname });
    const data = [{
        nama: "Muhammad Mayudin",
        email: "muhammadmayudin12@gmail.com"
    },
    {
        nama: "Mayudin",
        email: "mayudin12@gmail.com"
    },
    {
        nama: "ghodel",
        email: "ghodelchibar@gmail.com"
    }];

    res.render('about', {
        layout: 'layout/main-layouts',
        title: "Halaman About",
        data,
    });
});

app.get('/contact', (req, res) =>{
    // res.sendFile('./contact.html', { root: __dirname });

    const contacts = loadContact();
    
    res.render('contact', {
        layout: 'layout/main-layouts',
        title: "Halaman Contact",
        contacts,
        msg: req.flash('msg')
    });
});

// Halaman form tambah data contact

app.get('/contact/add', (req, res) =>{
    
    res.render('add-contact', {
        layout: 'layout/main-layouts',
        title: "Halaman Detail Contact"
    });
});

// prosess data contact

app.post('/contact', [
    body('nama').custom((value) => {
        const duplikat = cekDuplikat(value);
        if(duplikat){
            throw new Error('Nama contact sudah digunakan !');
        }
        return true;
    }),
    check('email', 'Email tidak valid').isEmail(),
    check('telepon', 'Nomor Telepon Tidak Valid').isMobilePhone('id-ID')], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });

        res.render('add-contact',{
            layout: 'layout/main-layouts',
            title: 'Halaman Add Contact',
            errors: errors.array()
        });

    } else {
        addContact(req.body);
        // flash message 
        req.flash('msg', 'Data berhasil ditambahkan!')
        res.redirect('/contact');
    }
});

app.get('/contact/:nama', (req, res) =>{
    // res.sendFile('./contact.html', { root: __dirname });

     const data = findContact(req.params.nama);
    
    res.render('detail', {
        layout: 'layout/main-layouts',
        title: "Halaman Detail Contact",
        data
    });
});

app.get('/product/:id', (req, res) =>{
    // res.send('Product ID : ' + req.params.id);

    const data = req.params.id;

    res.render('product', {
        layout: 'layout/main-layouts',
        title: "Halaman Product",
        data,
    });
});

app.use('/', (req, res) => {
    res.status(404);
    res.send('<h1> 404 : File Not Found</h1>');
});

app.listen(port, () => {
    console.log(`Server app listening at http://localhost:${port}`);
});