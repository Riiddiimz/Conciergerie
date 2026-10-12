(() => {
  "use strict";
  const getPath = (obj, path) => path.split(".").reduce((value, key) => value == null ? undefined : value[key], obj);
  const setContent = (root, content) => {
    root.querySelectorAll("[data-content]").forEach((node) => {
      const value = getPath(content, node.dataset.content);
      if (value !== undefined && value !== null) node.textContent = String(value);
    });
    root.querySelectorAll("[data-html]").forEach((node) => {
      const value = getPath(content, node.dataset.html);
      if (value !== undefined && value !== null) node.innerHTML = String(value);
    });
    root.querySelectorAll("[data-attr-src],[data-attr-alt],[data-attr-href],[data-attr-title],[data-aria-label]").forEach((node) => {
      for (const [attribute, path] of Object.entries(node.dataset)) {
        if (!attribute.startsWith("attr") && attribute !== "ariaLabel") continue;
        const name = attribute === "ariaLabel" ? "aria-label" : attribute.slice(4).toLowerCase();
        const value = getPath(content, path);
        if (value !== undefined && value !== null) node.setAttribute(name, String(value));
      }
    });
    root.querySelectorAll("[data-options]").forEach((select) => {
      const options = getPath(content, select.dataset.options) || [];
      select.replaceChildren(...options.map((option) => {
        const element = document.createElement("option");
        element.value = option.value;
        element.textContent = option.label;
        return element;
      }));
    });
  };
  const renderLists = (content) => {
    document.querySelectorAll("[data-list][data-template]").forEach((container) => {
      const items = getPath(content, container.dataset.list);
      const template = document.getElementById(container.dataset.template);
      if (!Array.isArray(items) || !template) return;
      container.replaceChildren();
      items.forEach((item) => {
        const fragment = template.content.cloneNode(true);
        fragment.querySelectorAll("[data-item]").forEach((node) => {
          const value = getPath(item, node.dataset.item);
          if (value !== undefined && value !== null) node.textContent = String(value);
        });
        fragment.querySelectorAll("[data-item-attr-src],[data-item-attr-alt]").forEach((node) => {
          if (node.dataset.itemAttrSrc && item[node.dataset.itemAttrSrc]) node.setAttribute("src", item[node.dataset.itemAttrSrc]);
          if (node.dataset.itemAttrAlt && item[node.dataset.itemAttrAlt]) node.setAttribute("alt", item[node.dataset.itemAttrAlt]);
        });
        fragment.querySelectorAll("[data-item-list]").forEach((node) => {
          const values = getPath(item, node.dataset.itemList);
          if (Array.isArray(values)) node.replaceChildren(...values.map((value) => {
            const li = document.createElement("li");
            li.textContent = String(value);
            return li;
          }));
        });
        container.appendChild(fragment);
      });
    });
  };
  const initMenu = () => {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    const close = () => { toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
    document.addEventListener("click", (event) => { if (!nav.contains(event.target) && !toggle.contains(event.target)) close(); });
  };
  const initReveal = () => {
    const elements = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    elements.forEach((element) => observer.observe(element));
  };
  const initContactForm = (content) => {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const feedback = document.getElementById("form-feedback");
    const emailDestination = getPath(content, "site.email");
    const params = new URLSearchParams(window.location.search);
    const profile = params.get("profil");
    const profileSelect = form.elements.profil;
    if (profile && profileSelect) {
      const option = [...profileSelect.options].find((item) => item.value.toLowerCase() === profile.toLowerCase());
      if (option) profileSelect.value = option.value;
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("nom") || "").trim();
      const email = String(data.get("email") || "").trim();
      const message = String(data.get("message") || "").trim();
      const consent = form.elements.consentement.checked;
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const valid = name.length > 1 && emailValid && message.length > 2 && consent;
      feedback.classList.toggle("is-error", !valid);
      feedback.textContent = getPath(content, valid ? "contact.formulaire.succes" : "contact.formulaire.erreur") || "";
      if (!valid) {
        const firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      const subject = encodeURIComponent("Demande de contact — " + name);
      const body = encodeURIComponent(
        "Nom : " + name + "\nE-mail : " + email + "\nTéléphone : " + String(data.get("telephone") || "Non renseigné") +
        "\nProfil : " + String(data.get("profil") || "Non précisé") + "\n\nMessage :\n" + message
      );
      window.location.href = "mailto:" + encodeURIComponent(emailDestination) + "?subject=" + subject + "&body=" + body;
    });
  };
  fetch("content.json")
    .then((response) => {
      if (!response.ok) throw new Error("Impossible de charger content.json");
      return response.json();
    })
    .then((content) => {
      content.site.email_href = "mailto:" + content.site.email;
      content.site.telephone_href = "tel:" + content.site.telephone.replace(/[^+\d]/g, "");
      const page = document.body.dataset.page || "accueil";
      const pageContent = content[page] || content.accueil;
      document.title = pageContent.meta_title || content.site.nom;
      const description = document.querySelector('meta[name="description"]');
      if (description && pageContent.meta_description) description.setAttribute("content", pageContent.meta_description);
      setContent(document, content);
      renderLists(content);
      initMenu();
      initContactForm(content);
      initReveal();
    })
    .catch((error) => {
      console.error(error);
      document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    });
})();