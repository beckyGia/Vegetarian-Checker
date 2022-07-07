document.querySelector("button").addEventListener("click", getFetch);

function getFetch() {
  let inputVal = document.getElementById("barcode").value;

  if (inputVal.length !== 12) {
    alert(`Please ensure that barcode is 12 characters`);
    return;
  }

  const url = `https://world.openfoodfacts.org/api/v0/product/${inputVal}.json`;

  fetch(url)
    .then((res) => res.json()) // parse response as JSON
    .then((data) => {
      console.log(data);
      if (data.status === 1) {
        //call additional stuff
        const item = new ProductInfo(data.product);
        item.turnOn();
        item.listIngredients();
        item.listNutrition();
        item.showInfo();
      } else if (data.status === 0) {
        //product is not found
        alert(`Product ${inputVal} not found. Please try another.`);
      }
    })
    .catch((err) => {
      console.log(`error ${err}`);
    });
}

class ProductInfo {
  constructor(productData) {
    //So productData is equal to data.product
    this.name = productData.product_name;
    this.image = productData.image_url;
    this.ingredients = productData.ingredients;
    this.nutrition = productData.nutriments;
  }

  showInfo() {
    document.getElementById("product-img").src = this.image;
    document.getElementById("product-img").alt = `This is an of ${this.name}`;
    document.getElementById("product-name").innerText = this.name;
  }

  listIngredients() {
    let paragraphRef = document.getElementById("ingredient-list");

    paragraphRef.innerText = "";

    if (!(this.ingredients == null)) {
      for (let key in this.ingredients) {
        let newDiv = document.createElement("div");
        newDiv.classList.add("tooltip");
        let newText = document.createTextNode(
          `${this.ingredients[key].text}, `
        );
        let newTextSpan = document.createElement("span");
        newTextSpan.classList.add("reg-text");
        let newSpan = document.createElement("span");
        newSpan.classList.add("tooltiptext");
        let vegStatus =
          this.ingredients[key].vegetarian == null
            ? "unknown"
            : this.ingredients[key].vegetarian;
        let newVeg = document.createTextNode(` ${vegStatus} `);
        newTextSpan.appendChild(newText);
        newSpan.appendChild(newVeg);
        newDiv.appendChild(newTextSpan);
        newDiv.appendChild(newSpan);
        paragraphRef.appendChild(newDiv);
      }
    }
  }

  turnOn() {
    const table = document.getElementById("nutrition-table");
    const div = document.getElementById("show");
    table.classList.remove("hidden");
    div.classList.remove("hidden");
  }

  listNutrition() {
    let tableRef = document.getElementById("nutrition-table");

    const selectedNut = Object.fromEntries(
      [
        "energy-kcal",
        "fat",
        "saturated-fat",
        "carbohydrates",
        "sugars",
        "fiber",
        "proteins",
        "sodium",
        "fruits-vegetables-nuts-estimate-from-ingredients_serving",
      ]
        .filter((key) => key in this.nutrition) // line can be removed to make it inclusive
        .map((key) => [key, this.nutrition[key]])
    );

    const units = Object.fromEntries(
      [
        "energy-kcal_unit",
        "fat_unit",
        "saturated-fat_unit",
        "carbohydrates_unit",
        "sugars_unit",
        "fiber_unit",
        "proteins_unit",
        "sodium_unit",
      ]
        .filter((key) => key in this.nutrition) // line can be removed to make it inclusive
        .map((key) => [key, this.nutrition[key]])
    );
    units["fruits-vegetables-nuts-estimate-from-ingredients_serving_unit"] =
      "%";

    for (let i = 1; i < tableRef.rows.length; ) {
      tableRef.deleteRow(i);
    }

    if (!(this.nutrition == null)) {
      for (let key in selectedNut) {
        let newRow = tableRef.insertRow(-1); //append a row to the end of my table, don't want it to be on top of the headers, we use -1
        let name = selectedNut;
        // insert two new cells: one for the nutrition name and the other for the value
        let newNCell = newRow.insertCell(0);
        let newFCell = newRow.insertCell(1);
        let newNText = document.createTextNode(key.replace(/-|_/g, " "));

        let facts = selectedNut[key].toFixed(2);
        let nutUnit = `${key}_unit`;
        let unit;

        if (units.hasOwnProperty(nutUnit)) {
          unit = units[nutUnit];
        }

        let newFText = document.createTextNode(facts);

        newNCell.appendChild(newNText);
        newFCell.append(newFText, unit);
      }
    } else {
      const table = document.getElementById("nutrition-table");
      table.classList.add("hidden");
    }
  }
}
