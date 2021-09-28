/*
    Storage Manager Plugin
    Adding functions to ImpactJS Game Class to manage game's data in localStorage
    Docs: https://docs.google.com/document/d/14kzaC8yl2QbJzMFEIkIJWviY78GW0Cnz7WF9GRh9Klg
    Dependency: IO Manager Plugin
    Created by Fedy Yapary on 2017-09-08
*/
ig.module('plugins.io.storage-manager')
.requires('impact.game', 'plugins.io.io-manager')
.defines(function() {
    ig.Game.prototype.name = "MJS-Game";
    ig.Game.prototype.version = "1.0";
    ig.Game.prototype.sessionData = {};
    ig.Game.prototype.initData = function(){
        // Set Data to Store
        return this.sessionData = {
            sound: 0.5,
            music: 0.5,
            level: 1,
            score: 0
        };
    };
    ig.Game.prototype.setupStorageManager = function(){
        if(typeof(this.name) === "undefined"){
            console.error("Cannot found Game Name, Storage Manager Cancelled.");
        }else if(typeof(this.version) === "undefined"){
            console.error("Cannot found Game Version, Storage Manager Cancelled.");
        }else {
            if(!this.io){
                this.io = new IoManager();
                console.log("IO Manager doesn't existed. Initialize...");
            }
            console.log("Plug in Storage Manager");
            this.storage = this.io.storage;
            this.storageName = this.name + "-v" + this.version;
            this.loadAll();
        }
    };
    ig.Game.prototype.loadAll = function(){
        var data = this.storage.get(this.storageName);
        if(data === null || typeof(data) === "undefined"){
            // Init Data to Store
            data = this.initData();
        }else{
            // Process Existed Data
        }
        
        for(var key in data){
			this.sessionData[key] = data[key];
        }
        this.storage.set(this.storageName, data);
    };
    ig.Game.prototype.saveAll = function(){
		var data = this.storage.get(this.storageName);
        for(var key in data){
            data[key] = this.sessionData[key];
        }
        this.storage.set(this.storageName, data);
    };
    ig.Game.prototype.load = function(key){
        var data = this.storage.get(this.storageName);
        return data[key];
    };
    ig.Game.prototype.save = function(key, value){
        var data = this.storage.get(this.storageName);
        data[key] = value;
        this.storage.set(this.storageName, data);
    };
});
