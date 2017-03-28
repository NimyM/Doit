var model={};
model.db=null;
model.open=function(){
    model.db = openDatabase("Registering", "0.1", "A Database of Registered Users", 10 * 1024 * 1024);
}

model.createTable = function() {
    var db = model.db;
    if(db){
        db.transaction(function(tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY ASC, username TEXT, password TEXT, emailId TEXT)",[]);    
            tx.executeSql("CREATE TABLE IF NOT EXISTS todolist (ID INTEGER PRIMARY KEY ASC, category TEXT,flag INTEGER,userid INTEGER, FOREIGN KEY(userid) REFERENCES users(id) )",[]);
            tx.executeSql("CREATE TABLE IF NOT EXISTS todos (todoid INTEGER PRIMARY KEY ASC, task TEXT,flag INTEGER,categoryid INTEGER, FOREIGN KEY(categoryid) REFERENCES todolist(ID))",[]);
        });
    }
    else {
        alert("WebSQL is not supported by your browser!");
    }
}

model.addUser = function(username,password,emailId) {
    var db = model.db;
    db.transaction(function(tx){
        tx.executeSql('INSERT INTO users (username, password,emailId) VALUES (?, ?, ?)', [username,password,emailId]);
       window.location.href="index.html?signedUp=1"; 
    });
}

model.deleteUser = function(id) {
    var db = model.db;
    db.transaction(function(tx){
        tx.executeSql("DELETE FROM users WHERE id=?", [id],model.error);
    });
}

model.checkLogin=function(emailId,password){
     
    var db=model.db;
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM users WHERE password=? AND emailId=?',[password,emailId],function(tx,results){
            if(results.rows.length>0){
        localStorage.setItem('id',results.rows[0].id);
                window.location.href="dashboard.html";
        var current=[emailId,password];
        localStorage.setItem('currentuser',current);
        localStorage.setItem('flag',1);
            }
            else{
                app.error();
            }
    });
        
        tx.executeSql('SELECT * FROM todolist WHERE userid=?',[localStorage.getItem('id')],function(tx,results){
            if(results.rows.length==0)
                localStorage.setItem('categoryid',0);
        });
    });
    
}

model.emailCheck=function(username,password,emailId){
    var db=model.db;
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM users WHERE emailId=?',[emailId],function(tx,results){
            if(results.rows.length!=0){
                $('#err5').css("display","block");
            }
            else{
                $('#err5').css("display","none");
                if(password.length>7){
                model.addUser(username,password,emailId);
                $('#err4').css("display","none");
                }
                else{
                    $('#err4').css("display","block");
                }
            }   
        });
    });
}

model.init=function(){
    model.open();
    model.createTable();
    if(localStorage.getItem('flag')==1){
        model.displayTodo(app.displayTodo);
        model.displayArchive(app.displayArchive);
        model.numberCurrent(app.numberCurrent);
        model.numberComplete(app.numberComplete);
        app.profileUpdate();
        
    }
    else{
        window.history.forward();
    }
}

model.profile=function(callback){
    var profilename,profileid;
    var db=model.db;
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM users WHERE id=?',[localStorage.getItem('id')],function(tx,results){
             profilename= results.rows[0].username;
             profileid=results.rows[0].emailId;
            callback(profilename,profileid);
        });
    });
}

model.addTodo=function(name){
    var db=model.db;
    db.transaction(function(tx){
        tx.executeSql('INSERT INTO todolist(category,userid,flag)VALUES(?,?,?)',[name,localStorage.getItem('id'),0]);
        tx.executeSql('SELECT * FROM todolist WHERE category=?', [name], function(tx, results) {
            localStorage.setItem('categoryid',results.rows[0].ID);});
    });
}

model.removeTodo=function(id){
    var mydb=model.db;
    mydb.transaction(function(tx){
        tx.executeSql("DELETE FROM todolist WHERE ID=?", [id]);
    });
}

model.addTask=function(task,id){
    var db=model.db;
    db.transaction(function(tx){
                tx.executeSql('INSERT INTO todos(task,categoryid,flag) VALUES(?,?,?)',[task,id,0]);
    });
}

model.removeTask=function(id){
    var mydb=model.db;
    mydb.transaction(function(tx){
        tx.executeSql("DELETE FROM todos WHERE todoid=?", [id]);
    });
}

model.displayTodo=function(func){
    var mydb=model.db;
    mydb.transaction(function(tx){
        var idno=localStorage.getItem('id');
        tx.executeSql('SELECT * FROM todolist WHERE userid=? AND flag=0', [idno], func);            
    });
}

model.displayArchive=function(func1){
    var mydb=model.db;
    mydb.transaction(function(tx){
        tx.executeSql('SELECT * FROM todolist WHERE userid=? AND flag=?',[localStorage.getItem('id'),1],func1);
    });
}

model.numberCurrent=function(func2){
    var db=model.db;
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM todolist WHERE userid=? AND flag=?',[localStorage.getItem('id'),0],func2);
    });
}

model.numberComplete=function(func2){
    var db=model.db;
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM todolist WHERE userid=? AND flag=?',[localStorage.getItem('id'),1],func2);
    });
}

model.getParameterByName=function(name){
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

model.saveProfile=function(name,mail){
    var db=model.db;
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM users WHERE emailId=?',[mail],function(tx,results){
            console.log(results.rows.length);
            if(results.rows.length==0){
                $('#err05').css("display","none");
                tx.executeSql('UPDATE users SET username=? WHERE id=?',[name,localStorage.getItem('id')]);
                tx.executeSql('UPDATE users SET emailId=? WHERE id=?',[mail,localStorage.getItem('id')]);
            }
            else{
                tx.executeSql('SELECT * FROM users WHERE id=?',[localStorage.getItem('id')],function(tx,results){
                    if(results.rows[0].emailId!=mail)
                        $('#err05').css("display","block");
                });
                
            }
        });
        
    });

}


model.check=function(callback,i){
    var idno=0;
    var mydb=model.db;       
        mydb.transaction(function (tx) { 
             tx.executeSql('SELECT * FROM todos WHERE categoryid=?',[i],function(tx,r){
                var n=r.rows.length;
                 idno=r.rows[n-1].todoid;
                 callback(idno);
             });
});
}

model.update=function(x,y){
    var mydb=model.db;
   mydb.transaction(function(tx){
       tx.executeSql('UPDATE todos SET flag=? WHERE todoid=?',[x,y],function(tx,results){
                tx.executeSql('SELECT * FROM todos WHERE todoid=?',[y],function(tx,results){
                    console.log(results.rows.length);
                    tx.executeSql('SELECT COUNT(flag) AS c FROM todos WHERE flag=? AND categoryid=?', [1,results.rows[0].categoryid], function (tx, r) {
                        tx.executeSql('SELECT * FROM todos WHERE categoryid=?',[results.rows[0].categoryid],function(tx,result){
                            console.log(result.rows.length);
                        if(result.rows.length==r.rows[0].c){
                            console.log(r.rows[0].c);
                            model.updateCategory(1,results.rows[0].categoryid);
                        }
                        else{
                            console.log(r.rows[0].c);
                            model.updateCategory(0,results.rows[0].categoryid);
                        }
                            });
                    });
                });  
           });
   }); 
}

model.updateCategory=function(x,y){
    var mydb=model.db;
   mydb.transaction(function(tx){
                tx.executeSql('UPDATE todolist SET flag=? WHERE ID=?',[x,y]);
            });
}

model.currentPassword=function(callback){
    var mydb=model.db;
    var pwd='';
   mydb.transaction(function(tx){
                tx.executeSql('SELECT * FROM users WHERE id=?',[localStorage.getItem('id')],function(tx,results){
                    pwd=results.rows[0].password;
                    callback(pwd);
                });
            });
}

model.savePassword=function(pwd){
    var mydb=model.db;
   mydb.transaction(function(tx){
                tx.executeSql('UPDATE users SET password=? WHERE id=?',[pwd,localStorage.getItem('id')]);
            });
}

model.edit=function(callback,id){
    var mydb=model.db;
    var task;
        mydb.transaction(function(tx){
            tx.executeSql('SELECT * FROM todos WHERE todoid=?',[id],function(tx,results){
                task=results.rows[0].task;
                callback(task);
            });
        });

}

model.add=function(taskname,id){
    var mydb=model.db;
     mydb.transaction(function(tx){
                tx.executeSql('UPDATE todos SET task=? WHERE todoid=?',[taskname,id]);
     });
}
var app={
    initialize:function(){
        model.init();
        this.attachHandlers();
    },
    attachHandlers:function(){
        var self=this;
        $(document).on("click", "#logout", self.logout);
        $(document).on("click", ".addtodo", self.addTask);  
        $(document).on("click",".change",function(){
            self.check($(this));
        });
        $(document).on("click",".addtask",function(){
            self.addTodo($(this));
        });
        $(document).on("click","#saveprofile",self.saveProfile);
        $(document).on("click","#confirm",self.currentPassword);
        $(document).on("click",".delete",function(){
            self.delete($(this));
        });
        $(document).on("click",".edit",function(){
            self.edit($(this));
        });
        $(document).on("click",".value",function(){
            self.add($(this));
        });
        $(document).on("click",".cancel",function(){
            self.cancel($(this));
        });
        $(document).on("click",".go",function(){window.history.back();});
    },
    
    logout:function(){
        window.location.href="index.html";
        localStorage.setItem('flag',0);
    },
    error:function(){
        $('#error').css("display","block");
    },
    signup: function(){
        var username = $("#usr").val();
        var password = $("#pwd").val();
        var emailId = $("#email").val();
        if(username!=="" && password!=="" && emailId!=''){
            $('#err').css("display","none");
            $('#err1').css("display","none");
            $('#err2').css("display","none");
            if( /(.+)@(.+){2,}\.(.+){2,}/.test(emailId) ){
                model.emailCheck(username,password,emailId);
                $('#err3').css("display","none");
            }
            else
                $('#err3').css("display","block");
        }
        else{
            $('#err').css("display","block");
            $('#err1').css("display","block");
            $('#err2').css("display","block");
        }
    },
    login:function(){
        var emailId = $("#user").val();
        var password = $("#paswd").val();
       
        if(emailId!="" && password!=""){
            model.checkLogin(emailId,password);
             $('#err6').css("display","none");
        }
        else
            $('#err6').css("display","block");
    },
    addTask:function(){
         var name=$('#ToDo').val();
        name=$.trim(name);
        name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if(name!=''){
            
        model.addTodo(name);
        var num1=parseInt(localStorage.getItem('categoryid'));
        console.log(num1);
        var num2=num1+1;
         $('#todos').append('<div class="input"><h5><b>'+name+'<b></h5><div class="checkbox"><div class="form-inline"><input type="text" class="form-control task" maxlength="100"><button type="button" class="btn btn-default btn-md addtask" data-id="'+num2+'">Add a To-do</button></div></div></div>');
        $('#ToDo').val('');
        }
    },
    addTodo:function(input){
        var task=input.prev().val();
        var num=input.data('id');
        task=$.trim(task);
        task = task.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            if(task!=''){
            model.addTask(task,num);
            model.check(function(idno){
            input.closest('div').parent().parent().append('<input type="checkbox" class="change" value="" data-id="'+idno+'"><span>'+task+'</span><br>');
            },num);
            $('.task').val('');
            }
    },
    displayTodo:function(tx,results){
        if(results.rows.length!=0){
        for(var i=0;i<results.rows.length;i++){
            
            if(results.rows[i].flag==0){
                var categoryname=results.rows[i].category;
                var categoryid=results.rows[i].ID;
              $('#listofitems').append('<li class="list-group-item listli"><span>'+categoryname+'</span><a href="newlist.html?id='+categoryid+'" data-id="'+categoryid+'" class="list">View</a></li>');  
            }
            
            }
            }
            else{
                 $('#listofitems').html('<span>Sorry, no items to display.<br><a href="newlist.html">Click here</a>&nbsp; to add new to-do list</span');
            }
    },
    displayArchive:function(tx,results){
        if(results.rows.length!=0){
            for(var i=0;i<results.rows.length;i++){
                    var id=results.rows[i].ID;
                    var name=results.rows[i].category;
                    $('#archivelist').append('<li class="list-group-item listli"><span>'+name+'</span><a href="newlist.html?id='+id+'" data-id="'+id+'" class="list">View</a></li>');
            }
        }
        else{
            $('#archivelist').html('<span>Sorry, no items to display.<br><a href="newlist.html">Click here</a>&nbsp; to add new to-do list</span');
        }
    },
    numberCurrent:function(tx,results){
        var num=results.rows.length;
        $('#currentbadge').html(''+num+'');
    },
    numberComplete:function(tx,results){
        var num=results.rows.length;
        $('#archivebadge').html(''+num+'');
    },
    profileUpdate:function(){
       model.profile(function(profilename,profileid){
        $('#profilename').val(''+profilename+'');
           $('#profileemail').val(''+profileid+'');
       }); 
    },
    check:function(box){
        if(box.prop("checked") == true){          
            var y=box.data('id');
            model.update(1,y);
        }
        else{
            var y=box.data('id');
            model.update(0,y);
        }
    },
    saveProfile:function(){
        var name=$('#profilename').val();
        var mail=$('#profileemail').val();
        name=$.trim(name);
        name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        mail=$.trim(mail);
        mail = mail.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if(name!='' && mail!=''){
            model.saveProfile(name,mail);
            $('#success1').css("display","block");
            $('#err00').css("display","none");
            $('#err01').css("display","none");
        }
        else{
            if(name=='')
                $('#err00').css("display","block");
            else
                $('#err00').css("display","none");
            if(mail=='')
                $('#err01').css("display","block");
            else
                $('#err01').css("display","none");
        }
    },
    currentPassword:function(){
        
        var currentpwd=$('#currentpwd').val();
        var newpwd=$('#newpwd').val();
        var renewpwd=$('#renewpwd').val();
        currentpwd=$.trim(currentpwd);
        currentpwd = currentpwd.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if(currentpwd!=''){
            $('#err08').css("display","none");
        model.currentPassword(function(pwd){
            console.log('x');
            if(pwd==currentpwd){
                $('#err7').css("display","none");
                if(newpwd!=''){
                     $('#err8').css("display","none");
                    if(renewpwd==newpwd){
                        $('#err9').css("display","none");
                        if(newpwd.length>7){
                        model.savePassword(newpwd);
                            $('#err06').css("display","none");
                        
                        $('#currentpwd').val('');
                        $('#newpwd').val('');
                        $('#renewpwd').val('');
                        $('#success').css("display","block");
                        }
                        else{
                            $('#err06').css("display","block");
                        }
                    }
                    else{
                        $('#err9').css("display","block");
                    }
                }
                else{
                    $('#err8').css("display","block");
                }
            }
            else{
                $('#err7').css("display","block");
            }
            
        });
        }
        else{
            $('#err08').css("display","block");
        }
    },
    delete:function(input){
        input.parent().parent().parent().remove();
        var id=input.data('id');
        model.removeTask(id);
    },
    add:function(task){
         
        var id=task.data('id');
            var taskname=task.parent().find('.task').val();
        taskname=$.trim(taskname);
        taskname = taskname.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if(taskname!=''){
   //         $('li').removeClass("editview");
           model.add(taskname,id);
                task.parent().parent().html('<div class="left">'+taskname+'</div><div class="right"><img src="images/edit.png" class="img-thumbnail edit" data-id="'+id+'"><img src="images/delete.png" class="img-thumbnail delete" data-id="'+id+'"></div>');
        }
            },
    edit:function(input){
        var id=input.data('id');
        model.edit(function(task){
         input.parent().parent().html('<div class="form-inline"><input type="text" class="task form-control" value="'+task+'" maxlength="100"><button type="button" class="btn btn-default btn-md value" data-id="'+id+'">Save</button><button type="button" class="btn btn-default btn-md cancel" data-id="'+id+'">Cancel</button></div>');
        },id);   
 //       $('li').addClass("editview");
            },
    cancel:function(tsk){
//        $('li').removeClass("editview");
       var id=tsk.data('id');
        model.edit(function(task){
            tsk.parent().parent().html('<div class="left">'+task+'</div><div class="right"><img src="images/edit.png" class="img-thumbnail edit" data-id="'+id+'"><img src="images/delete.png" class="img-thumbnail delete" data-id="'+id+'"></div>');
        },id);
    }
}
$(document).ready(function(){
    app.initialize();
    var value=model.getParameterByName('signedUp');
    if(value!='')
        $('#signed').css("display","block");
     $('#mobile-menu').click(function() {
                  $('ul').slideToggle();
              });
   
});
