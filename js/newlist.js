$(document).ready(function(){
    var name = model.getParameterByName('id');
    if(name!='')
    display(name);
    var mydb=model.db;
        mydb.transaction(function(tx){           
            tx.executeSql('SELECT * FROM todos WHERE categoryid=?',[name],function(tx,results){
                
                for(var i=0;i<results.rows.length;i++){
                    $(':checkbox').each(function(){
                        if($(this).data('id')==results.rows[i].todoid){
                        if(results.rows[i].flag==1)
                            $(this).prop("checked",true);
                    }
                    }) 
                }          
            })
        });
    function display(y){
         $('li a').removeClass('active');
        var mydb=model.db;
        mydb.transaction(function(tx){
            tx.executeSql('SELECT * FROM todolist WHERE ID=?',[y],function(tx,results){
                
                var name=results.rows[0].category;
                $('#todohead').html('<button type="button" class="btn btn-default go">Back</button><h3 class="text-center">'+name+'</h3>');
                tx.executeSql('SELECT * FROM todos WHERE categoryid=?', [y], function(tx, results) {    
                
                    for(var i=0;i<results.rows.length;i++){
                        var taskname=results.rows[i].task;
                    
                        $('#todobody').append('<li class="list-group-item form-inline"><input type="checkbox" class="change" data-id="'+results.rows[i].todoid+'"><div class="replace"><div class="left">'+taskname+'</div><div class="right"><img src="images/edit.png" class="img-thumbnail edit" data-id="'+results.rows[i].todoid+'" title="Edit task"><img src="images/delete.png" class="img-thumbnail delete" data-id="'+results.rows[i].todoid+'" title="Delete task"></div></div></li>');
                    };
                    $('.add').html('<div class="form-inline"><input type="text" class="form-control" id="tasks" maxlength="100"><button type="button" class="btn btn-default addtasks">Add</button></div>');
               
                    $('#ToDo').hide();
                    $('.addtodo').hide();
                   
                });
            });
            
        });
}    
     $(document).on('click','.addtasks',function(){
         var thisForm=this;
         var task=$('#tasks').val();
         task= $.trim(task);
         task = task.replace(/</g, "&lt;").replace(/>/g, "&gt;");
         if(task!=''){
            
         var mydb=model.db;
         mydb.transaction(function(tx){
             tx.executeSql('INSERT INTO todos(task,categoryid,flag) VALUES(?,?,?)',[task,name,0],function(tx,results){
             tx.executeSql('SELECT * FROM todos WHERE categoryid=? AND task=?',[name,task],function(tx,results){               
                     $('#todobody').append('<li class="list-group-item"><input type="checkbox" class="change" value="" data-id="'+results.rows[0].todoid+'"><div class="replace"><div class="left">'+task+'</div><div class="right"><img src="images/edit.png" class="img-thumbnail edit" data-id="'+results.rows[0].todoid+'" title="Edit task"><img src="images/delete.png" class="img-thumbnail delete" data-id="'+results.rows[0].todoid+'" title="Delete task"></div></div></li>');
             });
             
              model.updateCategory(0,name);
                 });
         });
         $('#tasks').val('');
         }
     });         

    $(document).on('click','.change',function(){
        var mydb=model.db;
        if($(this).prop("checked") == true){
            
            var y=$(this).data('id');
            mydb.transaction(function(tx){
                tx.executeSql('UPDATE todos SET flag=? WHERE todoid=?',[1,y]);
            });
        }
        else{
            var y=$(this).data('id');
            mydb.transaction(function(tx){
                tx.executeSql('UPDATE todos SET flag=? WHERE todoid=?',[0,y]);
            });
        }
    });
});