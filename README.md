# European Public Procurement Visualization

Interactive visualization of European public procurement awards using TED Contract Award Notices from 2021 to 2023.

## Live visualization

The published visualization is available here:

[https://suavesote.github.io/european-public-procurement-visualization/](https://suavesote.github.io/european-public-procurement-visualization/)

## Project overview

This project explores how European public procurement awards are distributed by year, buyer country, contract type and CPV sector.

The goal is not to build a complete procurement analysis system, but to provide a clear interactive overview of the main patterns found in the processed TED award data.

## Data source

The visualization uses TED Contract Award Notices from 2021 to 2023.

The original dataset was cleaned and aggregated before visualization. The final published version only includes the processed CSV files needed by the web page.

## Main features

* Overview KPIs for the processed dataset.
* Interactive metric selector:

  * Total awarded value.
  * Number of awards.
* Evolution of awards over time.
* Ranking of main buyer countries.
* CPV sector comparison.
* Contract type comparison by year.
* Supplier country information, separating domestic awards, cross-border awards and awards with unknown supplier country.

## Repository structure

```text
.
├── index.html
├── style.css
├── app.js
├── data
│   ├── summary_kpis.csv
│   ├── awards_by_year.csv
│   ├── awards_by_country.csv
│   ├── awards_by_cpv_division.csv
│   ├── awards_by_year_and_contract_type.csv
│   └── awards_by_year_and_supplier_status.csv
├── README.md
└── LICENSE
```

## How to run locally

Because the visualization loads CSV files with JavaScript, it should be opened through a local web server.

From the repository folder, run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Tools used

* HTML
* CSS
* JavaScript
* D3.js
* Plotly.js

## Notes and limitations

The visualization is exploratory. The original TED files contain a large number of records and some fields with missing or inconsistent values. For this reason, the data was cleaned and aggregated before publication.

The most extreme 0.5% of award values were excluded to reduce distortion in the exploratory charts.

The supplier country analysis should be interpreted carefully because the supplier country is not always available in the original data.

## License

This repository is released under the MIT License.
