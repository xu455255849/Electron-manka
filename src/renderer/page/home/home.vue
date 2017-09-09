<template>
    <div class="page-home">
        <div class="display" v-if="show" >
            <div class="photo-block" >
                <ul class="image-list">
                    <li v-for="item in imageList" :class="{ active: item.id == isActive}" :key="item.id" @click="changeImg(item)">
                        <img :src='item.url'  />
                    </li>
                </ul>
            </div>
            <img class="arrow-left" src="../../assets/l-arrow.png" @click="prev" />
            <img class="arrow-right" src="../../assets/r-arrow.png" @click="next"  />
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
                once: true,
                isActive: 1,
                show: false,
                imageList: []
                
            }
        },
        filters: {},
        methods: {
            prev: function () {
            
            },
            next: function () {
            
            },
            add: function () {
                ipc.send('open-file-dialog')
            },
            changeImg: function (item) {
                this.isActive = item.id
                document.querySelector('.display').style.backgroundImage = `url( ${item.url} )`
            }
        },
        components: {},
        mounted: function () {
            /**
             * 监听事件函数
             * @type {ElementTagNameMap[string]|any|Element|any}
             */
            ipc.on('selected-directory', (event, path)=> {
                this.show = true
                fs.stat(path[0], (err, stats)=> {
                    if (err) {
                        return
                    } else if (stats.isFile()) {
                        var buffer = fs.readFileSync(path[0]);
                        var blob = new Blob([buffer]);
                        var src = window.URL.createObjectURL(blob); //静态方法会创建一个 DOMString
                        this.imageList.push({
                            url: src,
                            id: 1
                        })
                        document.querySelector('.display').style.backgroundImage =  `url( ${src} )`
                    } else {
                        fs.readdir(path[0], (err, files)=> {
                            if (err) {
                                return console.log(err)
                            }
                            files.forEach( (file, i)=> {
                                
                                if (file.slice(-3) == 'jpg' || file.slice(-3) == 'png' || file.slice(-4) == 'jpeg') {
                                    
                                    const url = path[0] + '/' + file;
                                    const buffer = fs.readFileSync(url);
                                    const blob = new Blob([buffer]);
                                    const src = window.URL.createObjectURL(blob); //静态方法会创建一个 DOMString
                                    this.imageList.push({
                                        url: src,
                                        id: i
                                    })
                                    if (this.once) {
                                        this.once =false
                                        document.querySelector('.display').style.backgroundImage = `url( ${src} )`
                                    }
                                }
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
