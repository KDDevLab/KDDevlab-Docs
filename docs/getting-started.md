# Markdown Reference

## Überschriften

# H1
## H2  
### H3
#### H4

## Text-Formatierung

**fett** oder __fett__
*kursiv* oder _kursiv_
***fett und kursiv***
~~durchgestrichen~~

## Listen

### Ungeordnet
- Item 1
- Item 2
  - Sub-Item
  
### Geordnet
1. Erster
2. Zweiter
3. Dritter

## Links & Bilder

[Link Text](./page.md)
[Externer Link](https://example.com)
![Alt Text](./image.png)

## Code

Inline: `const x = 1`

Block:
```javascript
function hello() {
  console.log('Hello')
}
```

## Tabellen

| Spalte 1 | Spalte 2 |
|----------|----------|
| Wert 1   | Wert 2   |

## Hinweise (VuePress spezifisch)

::: tip Tipp
Das ist ein Tipp
:::

::: warning Warnung  
Vorsicht!
:::

::: danger Gefahr
Kritisch!
:::

## Frontmatter

---
title: Seitentitel
description: Beschreibung
---