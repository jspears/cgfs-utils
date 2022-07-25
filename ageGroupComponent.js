(function () {
  function ageGroupFor(janAge) {
    if (janAge < 6) {
      return 6;
    }
    return janAge + (janAge % 2);
  }
  function formatDate(d) {
    return d.toISOString().split("T")[0];
  }

  class AgeGroup extends HTMLElement {
    static get observedAttributes() {
      return ["min", "max", "month", "date"];
    }
    get relTo() {
      const jan1st = new Date();
      jan1st.setDate(this.date);
      jan1st.setMonth(this.month);
      jan1st.setFullYear(jan1st.getFullYear() + 1);
      return jan1st;
    }
    ago(years) {
      const t = new Date(this.relTo.getTime());
      t.setFullYear(t.getFullYear() - years);
      return t;
    }
    ageAt(birthDate) {
      return Math.abs(
        new Date(this.relTo.getTime() - birthDate.getTime()).getUTCFullYear() -
          1970
      );
    }
    get month() {
      return this.hasAttribute("month")
        ? Number(this.getAttribute("month"))
        : 0;
    }
    set month(val) {
      this.setAttribute("month", month);
    }
    get date() {
      return this.hasAttribute("date") ? Number(this.getAttribute("date")) : 1;
    }
    set date(val) {
      this.setAttribute("date", val);
    }

    // connect component
    get minAge() {
      return this.hasAttribute("min") ? Number(this.getAttribute("min")) : 4;
    }
    set minAge(val) {
      if (val) {
        this.setAttribute("min", val);
      } else {
        this.removeAttribute("min");
      }
    }
    get maxAge() {
      return this.hasAttribute("max") ? Number(this.getAttribute("max")) : 15;
    }

    set maxAge(val) {
      if (val) {
        this.setAttribute("max", val);
      } else {
        this.removeAttribute("max");
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = newValue;
    }

    connectedCallback() {
      const shadow = this.attachShadow({ mode: "closed" });
      shadow.innerHTML = `
    <style>
      p {
        font-weight: normal;
        padding: 1em;
       }
    </style>

    <input type="date" min="${formatDate(this.ago(this.maxAge))}" max="${formatDate(
        this.ago(this.minAge)
      )}"/>
    <p></p>
    `;
      shadow.querySelector("input").addEventListener("input", (e) => {
        if (!e.target.value) {
          return;
        }
        const janAge = this.ageAt(new Date(e.target.value));
        const p = shadow.querySelector("p");
        if (janAge < 4) {
          p.innerHTML = "Sorry must be 4 by " + formatDate(this.relTo);
        } else if (janAge > 14) {
          p.innerHTML = "Sorry must under  " + formatDate(this.relTo);
        } else {
          p.innerHTML = ageGroupFor(janAge) + "U";
        }
      });
    }
  }
  window.customElements.define("age-group", AgeGroup);
  console.log("loaded");
})();
