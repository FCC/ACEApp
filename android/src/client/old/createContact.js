var Contacts = {
			index: window.localStorage.getItem("Contacts:index"),
			$table: document.getElementById("contacts-table"),
			$form: document.getElementById("contacts-form"),
			$button_save: document.getElementById("contacts-op-save"),
			$button_discard: document.getElementById("contacts-op-discard"),

			init: function() {
                
				// initialize storage index
				if (!Contacts.index) {
					window.localStorage.setItem("Contacts:index", Contacts.index = 1);
				}

				// initialize form
				Contacts.$form.reset();
				Contacts.$button_discard.addEventListener("click", function(event) {
					Contacts.$form.reset();
					Contacts.$form.id_entry.value = 0;
				}, true);
				Contacts.$form.addEventListener("submit", function(event) {
					var entry = {
						id: parseInt(this.id_entry.value),
						name: this.name.value,
						username: this.username.value,
						mobile_number: this.mobile_number.value,
                        work_number: this.work_number.value
					};
					if (entry.id == 0) { // add
						Contacts.storeAdd(entry);
						Contacts.tableAdd(entry);
					}
					else { // edit
						Contacts.storeEdit(entry);
						Contacts.tableEdit(entry);
					}

					this.reset();
					this.id_entry.value = 0;
                    event.preventDefault();
                    window.location.href = "../html/contactList.html";

				}, true);

				// initialize table
				if (window.localStorage.length - 1) {
					var contacts_list = [], i, key;
					for (i = 0; i < window.localStorage.length; i++) {
						key = window.localStorage.key(i);
						if (/Contacts:\d+/.test(key)) {
							contacts_list.push(JSON.parse(window.localStorage.getItem(key)));
						}
					}
				}
			},

			storeAdd: function(entry) {
				entry.id = Contacts.index;
				window.localStorage.setItem("Contacts:index", ++Contacts.index);
				window.localStorage.setItem("Contacts:"+ entry.id, JSON.stringify(entry));
			},
			storeEdit: function(entry) {
				window.localStorage.setItem("Contacts:"+ entry.id, JSON.stringify(entry));
			},
			storeRemove: function(entry) {
				window.localStorage.removeItem("Contacts:"+ entry.id);
			},
		};

$(function () {
		Contacts.init();
});
