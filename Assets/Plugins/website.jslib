mergeInto(LibraryManager.library, {

  SendEndNode: function (end) {
    sendEndNode(Pointer_stringify(end));
  },

  SendChoice: function (choice) {
  	sendChoice(Pointer_stringify(choice));
  }

});
