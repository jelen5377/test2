# URL Analyzer

Maly projekt se serverem a webovym rozhranim.

## Co umi

- vezme URL stranky
- stahne HTML na serveru
- vytahne text
- spocita cetnosti slov
- vrati 10 nejcastejsich slov

## Proc je tam backend

Stazeni cizi webove stranky primo z prohlizece casto narazi na CORS. Backend stranku nacte, zpracuje text a vrati vysledek klientovi.

## Lokalni spusteni

1. `npm install`
2. `npm start`
3. otevri `http://localhost:8787`

## Nasazeni

Frontend i backend jsou tady zamerne spolu, aby sel projekt snadno nasadit treba na:

- Render
- Railway
- Fly.io
- Azure Web App
- jakykoli Node.js hosting

## Poznamka

Projekt nepouziva AI ani externi API. Nema tedy zadne usage naklady za analyzu.
