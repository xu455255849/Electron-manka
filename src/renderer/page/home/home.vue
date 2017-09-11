<template>
    <div class="page-home">
        <div class="display" v-if="show" >
            <div class="photo-block" >
                <ul class="image-list" :style="{ width: scrollWidth + 'px'}">
                    <li v-for="item in imageList" :class="{ active: item.id == isActive}" :key="item.id" @click="changeImg(item)">
                        <img :src='item.url'  />
                    </li>
                </ul>
            </div>
            <img class="arrow-left" src="../../assets/l-arrow.png" @click="prev" />
            <img class="arrow-right" src="../../assets/r-arrow.png" @click="next"  />
            <img class="act-img" src="actImg" :class="{
                activeAllImg: actImgHeight > height && actImgWidth > width,
                activeHeiImg: actImgHeight > height && actImgWidth <= width,
                activeWidImg: actImgHeight <= height && actImgWidth > width
            }">
        </div>
        
        <div class="add-btn" v-else @click="add">
            Drag or Click your file to here ！
        </div>
    
    
    </div>
</template>

<script>
    const ipc = require('electron').ipcRenderer;
    var fs = require('fs')
    var sizeOf = require('image-size');
    
    
    // const  shell = require('shell');
    
    export default {
        name: 'page-home',
        data() {
            return {
                once: true,
                isActive: '',
                actImg: '',
                actImgHeight: '',
                actImgWidth: '',
                show: false,
                imageList: [],
                height: document.documentElement.clientHeight - 100,
                width: document.documentElement.clientWidth,
                scrollWidth: 0,
                index: 0,
                scrollLeft: 0,
            }
        },
        watch: {
        
        },
        methods: {
          
            prev: function () {
                if (document.querySelector('.photo-block').scrollLeft == 0) {
                    ipc.send('first')
                } else if (this.scrollWidth < this.width) {
                    console.log(this.imageList[this.isActive -  1])
                    
                }
            },
            next: function () {
                
                console.log(document.querySelector('.image-list').scrollLeft = 200)
                if (document.querySelector('.photo-block').scrollLeft == 0) {
                    ipc.send('first')
                    ipc.send('last')
                    
                    
                }
                document.querySelector('.photo-block').scrollLeft += 120;
            },
            add: function () {
                ipc.send('open-file-dialog')
            },
            changeImg: function (item) {
                document.querySelector('.act-img').src = item.url
                this.isActive = item.id
                this.scrollLeft = item.id * 120
                this.actImgHeight = item.height
                this.actImgWidth = item.width
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
                        var dimensions = sizeOf(path[0]);
                        var buffer = fs.readFileSync(path[0]);
                        var blob = new Blob([buffer]);
                        var src = window.URL.createObjectURL(blob); //静态方法会创建一个 DOMString
                        this.imageList.push({
                            url: src,
                            id: 0,
                            height: dimensions.height,
                            width: dimensions.width
                        });
                        document.querySelector('.act-img').src = src
                        this.isActive = 0
                        this.actImgHeight = dimensions.height
                        this.actImgWidth = dimensions.width
                    } else {
                        window.onkeyup = function (res) {
                            if (res.keyCode == 37) {
                                this.prev()
                            } else if (res.keyCode == 39) {
                                this.next()
                            }
                        };
                        fs.readdir(path[0], (err, files)=> {
                            if (err) {
                                return console.log(err)
                            }
                            files.forEach( (file)=> {
                                if (file.slice(-3) == 'jpg' || file.slice(-3) == 'png' || file.slice(-4) == 'jpeg') {
                                    
                                    const url = path[0] + '/' + file;
                                    var dimensions = sizeOf(url);
                                    const buffer = fs.readFileSync(url);
                                    const blob = new Blob([buffer]);
                                    const src = window.URL.createObjectURL(blob); //静态方法会创建一个 DOMString
                                    if (this.once) {
                                        this.once =false
                                        document.querySelector('.act-img').src = src
                                        this.isActive = this.index
                                        this.actImgHeight = dimensions.height
                                        this.actImgWidth = dimensions.width
                                    }
                                    this.imageList.push({
                                        url: src,
                                        id: this.index++,
                                        height: dimensions.height,
                                        width: dimensions.width
                                    });
                                    this.scrollWidth += 120
                                }
                            });
                            console.log(this.imageList)
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
