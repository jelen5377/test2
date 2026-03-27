# URL Analyzer - GitHub Pages verze

Staticka verze pripravena pro publikaci na GitHub Pages.

## Co umi

- analyzovat vlozeny text
- vypsat 10 nejcastejsich slov
- zkusit nacist obsah ze zadane URL primo v prohlizeci

## Omezeni GitHub Pages verze

GitHub Pages je jen staticky hosting bez backendu. Proto nelze spolehlive nacitat libovolne cizi weby. Browser casto narazi na CORS omezeni.

Proto aplikace funguje takto:

- nejspolehlivejsi je vlozit text rucne
- nacitani URL funguje jen u webu, ktere to vyslovne povoluji

## Publikace na GitHub Pages

Pouzivaji se jen soubory ve slozce `public`:

- `index.html`
- `style.css`
- `script.js`

Pro GitHub Pages je dej do rootu repozitare, nebo branch nastav na slozku, kterou chces publikovat.

## Bez nakladu

Projekt nepouziva AI ani zadne placene API.
