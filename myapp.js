var searchOn = false;
// List of classes for application
Ext.require([
    'Ext.form.*',
    'Ext.window.Window',
    'Ext.data.Connection',
    'Ext.Ajax'
]);

// Application's initialization
Ext.onReady(function() {
    //Main panel
    Ext.create('Ext.form.Panel', {
        renderTo: 'input_form',
        title: 'Input formular',
        width: 640,
        fieldDefaults: {
            labelAlign: 'left',
            labelWidth: 85,
            anchor: '100%'
        },
        url: 'test.py',
        defaultType: 'textfield',
        bodyPadding: 5,
        //text fields
        items: [{
            xtype: 'textfield',
            fieldLabel: 'nick',
            name: 'nick',
            minLength: 1,
            maxLength: 20,
            anchor:'100%'
        },{
            xtype: 'textfield',
            fieldLabel: 'title of text',
            name: 'titleOfText',
            minLength: 1,
            maxLength: 30,
            anchor: '100%'
        }, {
            xtype: 'textarea',
            fieldLabel: 'input text',
            name: 'itext',
            anchor: '100%'
        }, {
            xtype: 'numberfield',
            anchor: '35%',
            name: 'expMin',
            fieldLabel: 'exp (in min)',
            value: 0,
            maxValue: 4320,
            minValue: 0
        }],
        //buttons
        buttons: [{
        text: 'Search on/off',
        handler: function() {
                       //if searchOn=true > hide search formular and search result
                       if (searchOn) {
                        document.getElementById('search_form').innerHTML = "";
                        document.getElementById('search_result').innerHTML = "";
                        searchOn = false;
                       } else { //else show search formular
                       //search formular
                       Ext.create('Ext.form.Panel', {
                            renderTo: 'search_form',
                            title: 'Search formular',
                            width: 640,
                            fieldDefaults: {
                                labelAlign: 'left',
                                labelWidth: 120,
                                anchor: '100%'
                            },
                            bodyPadding: 5,
                            items: [
                              {
                                xtype: 'textfield',
                                fieldLabel: 'Expresion of search',
                                name: 'search',
                                anchor:'100%'
                            }],
                            buttons: [{
                                text: 'Search in nicks',
                                handler: function() {
                                         //call function with arg (sNick>nick to search; sN>search via nick mode)
                                         var sNick = this.up('form').getForm().getValues()['search'];
                                         feedback(sNick, '', '', '', 'sN');
                                }
                            },{
                                text: 'Search in titles',
                                handler: function() {
                                          //call function with arg (sTitle>title to search; sT>search via title mode)
                                          var sTitle = this.up('form').getForm().getValues()['search'];
                                          feedback('', sTitle, '', '', 'sT');
                                }
                            } 
                            
                            ] });
                            searchOn = true;
                           } 
        }
    }, {//button to reset form
        text: 'Reset',
        handler: function() {
            this.up('form').getForm().reset();
        }
    }, {//button to submit formular
        text: 'Submit',
        formBind: true,
        disabled: true,
        handler: function() {
             //get values from formular
             var nickV = this.up('form').getForm().getValues()['nick'];
             var titleOfTextV = this.up('form').getForm().getValues()['titleOfText'];
             var itextV = this.up('form').getForm().getValues()['itext'];
             var expMinV = this.up('form').getForm().getValues()['expMin'];
             var kBLength = unescape(encodeURIComponent(itextV)).length/1024;
             //test length of text
             if (kBLength>100) {
                                alert("Limit size 100kB (format UTF-8). Your size: " + kBLength + " kb !!!");
                               } else {//call function with arg (nickV>value of nick field; titleOfTextV>value of title field; itextV>value of text field; expMinV>value of exp field; mod>'w' mode to write to server;)
                                       mod = 'w';
                                       feedback(nickV, titleOfTextV, itextV, expMinV, mod); 
                                      }
        }
    }] 
    });

});
//function for call python 
function feedback(nV, tV, iV, eV, mode) {
    //Ajax request
    Ext.Ajax.request({
    url: 'test.py',
    params: {
        mode: mode,
        nick: nV,
        title: tV,
        itext: iV,
        expMin: eV
    },
    success: function(response){
        var text = response.responseText; //'text' > response from python
        
        //if output is only generated URL
        if (mode=='w') {
                        Ext.Msg.alert('Result', "Your input was saved ! Url to find them is: "+window.location.href + "test.py?mode=url&url=" + text);
                        Ext.getForm('form').reset();
                       } else {//else output is search result
        
                               //if response 'text' is nothing => no result       
                               if (text=='') {
                               document.getElementById('search_result').innerHTML = ""; 
                               Ext.Msg.alert('Result', 'No match !'); 
                              } else { //else response is structure of data
         
                                         document.getElementById('search_result').innerHTML = ""; //clear html element from previous results
                                         var arr = eval(text);  //string to array
                                         //data store
                                         var store = Ext.create('Ext.data.ArrayStore', {
                                             fields: [
                                                 {name: 'nick'},
                                                 {name: 'title'},
                                                 {name: 'exp'},
                                                 {name: 'url'},
                                                 {name: 'text'}
                                              ],
                                              data: arr
                                          });
                                         //presentation of data store (if mode=='sN' > presentation result from search via nick) 
                                         if (mode=='sN') {
                                                          Ext.create('Ext.grid.Panel', {
                                                          selType: 'cellmodel',
                                                          title: 'Result',
                                                          store: store,
                                                          columns: [
                                                            {header: 'Title of text',  dataIndex: 'title', width: 100},
                                                            {header: 'exp time', dataIndex: 'exp', width: 150},
                                                            {header: 'Text', dataIndex: 'text', width: 390, flex:1, 
                                                                                  field:{
                                                                                         xtype:'textfield',
                                                                                         allowBlank:false
                                                                                        }
                                                                  }],
                                                          width: 640,
                                                          plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
                                                                    clicksToEdit: 1
                                                                    })],
                                                          renderTo: 'search_result'
                                                          });
                                                          } else {//presentation of data store > presentation result from search via title
                                                                  Ext.create('Ext.grid.Panel', {
                                                                  title: 'Result',
                                                                  store: store,
                                                                  columns: [
                                                                      {header: 'Name',  dataIndex: 'nick', width: 100},
                                                                      {header: 'exp time', dataIndex: 'exp', width: 150},
                                                                      {header: 'Text', dataIndex: 'text', width: 390, flex:1, 
                                                                                  field:{
                                                                                         xtype:'textfield',
                                                                                         allowBlank:false
                                                                                        }
                                                                  }],
                                                                  width: 640,
                                                                  plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
                                                                            clicksToEdit: 1
                                                                            })],
                                                                  renderTo: 'search_result'
                                                                  });
                                                                  }
        } }
    }
    });
}