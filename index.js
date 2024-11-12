require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

const url = 'https://www.wikipedia.org/';

async function scrapeData() {
  try {

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const artigos = [];


    $('.central-featured-lang').each((i, el) => {
      const lingua = $(el).find('strong').text().trim();
      const link = $(el).find('a').attr('href');

      if (lingua && link) {
        artigos.push({ lingua, link: `https:${link}` });
      }
    });

    return artigos;
  } catch (error) {
    console.error("Erro ao acessar o site:", error);
    return [];
  }
}

async function sendEmail(content) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'venceslau.junior23@gmail.com',
    subject: 'Artigos Populares - Wikipédia',
    text: content.map(artigo => `Idioma: ${artigo.lingua}\nLink: ${artigo.link}\n`).join('\n\n')
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar o e-mail:', error);
  }
}

async function main() {
  const artigos = await scrapeData();

  if (artigos.length > 0) {
    await sendEmail(artigos);
  } else {
    console.log('Nenhum artigo encontrado para enviar por e-mail.');
  }
}

main();
