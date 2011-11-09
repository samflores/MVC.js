$(function() {
	window.Contact = Backbone.Model.extend({
		defaults: {
			"name": null,
			"phone": null,
			"mail": null,
			"twitter": null
		},

		validate: function(attrs) {
			if (attrs.name == null || attrs.name == "" || 
				((attrs.phone == null || attrs.phone == "") && 
				 (attrs.mail == null || attrs.mail == "") && 
				 (attrs.twitter == null || attrs.twitter == "")))
				 {
				 	return "Você deve preencher o <strong>nome</strong> e <strong>pelo menos uma</strong> forma de contato";
				 }
			var sameName = this.collection.select(function (contact) {
				return contact.get("name") == attrs.name && contact.get("id") != attrs.id;
			});
			if (sameName.length > 0)
				return "Você já cadastrou um contato com o nome <strong>" + attrs.name + "</string>" ;
		}
	});

	window.ContactsList = Backbone.Collection.extend({
		model: Contact,
		localStorage: new Store("contacts")
	});

	window.Contacts = new ContactsList();

	window.ContactView = Backbone.View.extend({
		tagName: "li",
		template: _.template($("#contact_template").html()),

		events: {
			"click a.delete": "deleteContact",
			"click a.edit": "editContact"
		},

		initialize: function() {
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);
		},

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		},

		deleteContact: function(ev) {
			this.model.destroy();
			return false;
		},

		editContact: function(ev) {
			this.model.trigger("edit", this.model);
			return false;
		},

		remove: function() {
			$(this.el).remove();
		}
	});

	window.ContactApp = Backbone.View.extend({
		el: $("#contacts_app"),

		events: {
			"keypress .new_contact input": "createOnEnter",
			"click .alert-message .close": "hideAlert"
		},

		initialize: function() {
			Contacts.bind("add", this.addContact, this);
			Contacts.bind("reset", this.addAllContacts, this)
			Contacts.bind("destroy", this.removeContact, this);
			Contacts.bind("edit", this.editContact, this);
			Contacts.fetch();
		},

		render: function() {
			return this;
		},

		addContact: function(contact) {
			var view = new ContactView({model: contact});

			this.$("#contacts_list").append(view.render().el);
		},

		addAllContacts: function() {
			Contacts.each(this.addContact);
		},

		editContact: function(contact) {
			$("#contact_id").val(contact.get("id"));
			$("#contact_name").val(contact.get("name"));
			$("#contact_phone").val(contact.get("phone"));
			$("#contact_mail").val(contact.get("mail"));
			$("#contact_twitter").val(contact.get("twitter"));
			$("#contact_name").focus();
		},

		createOnEnter: function(ev) {
			if (ev.keyCode != 13) {
				this.hideAlert();
				return;
			}
			var attributes = { name: $("#contact_name").val(), phone: $("#contact_phone").val(), mail: $("#contact_mail").val(), twitter: $("#contact_twitter").val() };
			var contactId = $("#contact_id").val();
			if (contactId === "" || $("#contact_id").val() === null) {
				if (Contacts.create(attributes, {error: this.showError, success: this.clearFields})) {
					this.showSuccess("Contato cadastrado com sucesso");
				}
			} else {
				var contact = Contacts.get(contactId);
				attributes["id"] = contactId;
				if (contact.save(attributes, {error: this.showError, success: this.clearFields})) {
					this.showSuccess("Contato atualizado com sucesso");
				}
			}
		},

		clearFields: function(model, response) {
			$("#contact_id").val("");
			$("#contact_name").val("");
			$("#contact_phone").val("");
			$("#contact_mail").val("");
			$("#contact_twitter").val("");
			$("#contact_name").focus();
		},

		removeContact: function(contact) {
			this.showSuccess("Contato apagado com sucesso");
		},

		hideAlert: function() {
			$("#alert").hide();
		},

		showError: function(model, error) {
			$("#alert").html("<div class='alert-message error'><a class='close' href='#'>×</a><p>" + error + "</p></div>").show();
		},

		showWarning: function(msg) {
			$("#alert").html("<div class='alert-message warning'><a class='close' href='#'>×</a><p>" + msg + "</p></div>").show();
		},

		showSuccess: function(msg) {
			$("#alert").html("<div class='alert-message success'><a class='close' href='#'>×</a><p>" + msg + "</p></div>").show();
		}
	});

	window.App = new ContactApp();
});