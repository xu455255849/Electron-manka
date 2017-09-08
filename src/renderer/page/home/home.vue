<template>
    <div class="page-home">
        <div class="display" v-if="show">
            <ul class="image-list">
                <li v-for="item in imageList" :key="item">
                    <img :src='item'  />
                </li>
            </ul>
        </div>
        
        <div class="add-btn" v-else @click="add">
            Drag or Click your file to here ！
        </div>
     
    
    </div>
</template>

<script>
    const ipc = require('electron').ipcRenderer;
    
    
    var fs = require('fs')
  
    
    // const  shell = require('shell');
    
    export default {
        name: 'page-home',
        data() {
            return {
                show: true,
                imageList: [
                    require('../../assets/logo.png'),
                    require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),require('../../assets/logo.png'),
                ]
            }
        },
        filters: {},
        methods: {
            add: function () {
                ipc.send('open-file-dialog')
            }
        },
        components: {},
        mounted: function () {
            /**
             * 监听事件函数
             * @type {ElementTagNameMap[string]|any|Element|any}
             */
            
            ipc.on('selected-directory', function (event, path) {
                fs.stat(path[0], (err, stats)=> {
                    if (err) {
                        return
                    } else if (stats.isFile()) {
                        var buffer = fs.readFileSync(path[0]);
                        var blob = new Blob([buffer]);
                        var src = window.URL.createObjectURL(blob); //静态方法会创建一个 DOMString
                        this.imageList.push(src)
                    } else {
                        fs.readdir(path[0], (err, files)=> {
                            if (err) {
                                return console.log(err)
                            }
                            console.log(files)
                            files.forEach( function (file){
                                const url = path[0] + '/' + file;
                                this.imageList.push(url)
                            });
                        })
                    }
                })
            })
            
            
            
            const holder = document.querySelector('.add-btn');
            holder.ondragover = function () {
                return false;
            };
            holder.ondragleave = holder.ondragend = function () {
                return false;
            };
            holder.ondrop = function (e) {
                e.preventDefault();
                var file = e.dataTransfer.files[0];
                console.log('File you dragged here is', file.path);
                return false;
            };
            
        },
    }
</script>

<style lang="less" scoped>
    @import "home";
</style>
