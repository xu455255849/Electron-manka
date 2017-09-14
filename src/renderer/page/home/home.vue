<template>
    <div class="page-home" :class="{ bgColor: select }">
        <div class="display" v-if="show" >
            <button  v-show="itemShow" @click="back">返回</button>
            <div class="photo-block" @mouseover="out" @mouseout="set" >
                <ul class="image-list" :style="{ width: scrollWidth + 'px'}">
                    <li v-for="item in imageList" :class="{ active: item.id == isActive}" :key="item.id" @click="changeImg(item)" v-show="itemShow">
                        <img :src='item.url'  />
                    </li>
                </ul>
            </div>
            <img v-show="itemShow" class="arrow-left" src="../../assets/l-arrow.png" @click="prev" />
            <img v-show="itemShow" class="arrow-right" src="../../assets/r-arrow.png" @click="next"  />
            <img class="act-img" style="max-width: 100%;max-height: 100%"  src="actImg" @mouseover="set" @mouseout="out" :class="{
               // activeAllImg: actImgHeight >= height && actImgWidth >= width,
                activeHeiImg: actImgHeight >= actImgWidth && actImgHeight >= width ,
                activeWidImg: actImgWidth >= actImgHeight && actImgWidth >= height
            }" />
        </div>
        
        <div style="height: 100%" v-else>
            <div class="history-list">
                <div class="history-item" v-for="(item, index) in foldList" :key="item._id" @click="operation($event,item.path)">
                    <img src="../../assets/x.png" @click="delHistory(item._id, index)" />
                    <p>{{ item.name }}</p>
                    <p>{{ item.path }}</p>
                </div>
            </div>
            <div class="add-btn"  @click="add">打开文件</div>
        </div>
    </div>
</template>

<script>
    const ipc = require('electron').ipcRenderer;
    const fs = require('fs')
    const sizeOf = require('image-size');
    
    
    // const  shell = require('shell');
    
    export default {
        name: 'page-home',
        data() {
            return {
                select: false,
                once: true,
                isActive: '',
                actImg: '',
                actImgHeight: '',
                actImgWidth: '',
                show: false,
                imageList: [],
                foldList: [],
                height: document.documentElement.clientHeight - 100,
                width: document.documentElement.clientWidth * 0.8,
                scrollWidth: 0,
                index: 0,
                scrollLeft: 0,
                itemShow: false,
            }
        },
        watch: {
            imageList: function () {
                if (this.imageList.length == 0) {
                    ipc.send('minWindow')
                } else {
                    ipc.send('maxWindow')
                }
            }
        },
        methods: {
            operation: function (e,path) {
                if (e.target.tagName == 'IMG') {
                    return
                } else {
                    this.show = true
                    fs.stat(path, (err, stats)=> {
                        if (err) {
                            return
                        } else if (stats.isFile()) {
                            if (path.slice(-3) == 'jpg' || path.slice(-3) == 'png' || path.slice(-4) == 'jpeg') {
                                var dimensions = sizeOf(path);
                                var buffer = fs.readFileSync(path);
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
        
                                this.select = true
                            } else {
                                alert('请确保至少有一张图片')
                                location.reload()
                            }
                        } else {
                            fs.readdir(path, (err, files)=> {
                                if (err) {
                                    alert(err)
                                }
                                files.forEach( (file)=> {
                                    if (file.slice(-3) == 'jpg' || file.slice(-3) == 'png' || file.slice(-4) == 'jpeg') {
                                        const url = path + '/' + file;
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
                            
                                            this.select = true
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
                                if (this.imageList.length == 0) {
                                    alert('请确保至少有一张图片')
                                    location.reload()
                                }
                            })
                        }
                    })
                }
            },
            delHistory: function (id, index) {
                this.$db.remove({ _id: id }, {}, (err, numRemoved)=> {
                    if (err)
                        alert('出错')
                    this.foldList.splice(index, 1)
                    // numRemoved = 1
                });
            },
            back: function () {
                this.imageList = []
                this.select = false
                this.once = true
                this.index = 0
                this.scrollWidth = 0
                this.scrollLeft = 0
                this.show = false
            },
            set: function () {
              this.itemShow = false
            },
            out: function () {
              this.itemShow = true
            },
            prev: function () {
                if (this.isActive == 0) {
                    ipc.send('first')
                } else {
                    this.changeImg(this.imageList[this.isActive - 1])
                }
            },
            next: function () {
                if (this.isActive == this.imageList.length -1) {
                    ipc.send('last')
                } else  {
                    this.changeImg(this.imageList[this.isActive + 1])
                }
            },
            add: function () {
                ipc.send('open-file-dialog')
            },
            changeImg: function (item) {
                this.isActive = item.id
                this.actImgHeight = item.height
                this.actImgWidth = item.width
                document.querySelector('.act-img').src = item.url
                this.scrollLeft = item.id * 120
                document.querySelector('.photo-block').scrollLeft = this.scrollLeft - this.width/2
            }
        },
        components: {},
        mounted: function () {
          /* this.$db.remove({}, { multi: true }, function (err, num) {
               if (err)
                   alert(err)
               console.log(num)
           })*/
          
            this.$db.find({}, (err, res)=> {
                this.foldList = res
            })
    
            window.onkeyup =  (res)=> {
                if (this.imageList.length !== 0) {
                    if (res.keyCode == 37) {
                        this.prev()
                    } else if (res.keyCode == 39) {
                        this.next()
                    }
                }
            };
            /**
             * 监听事件函数
             * @type {ElementTagNameMap[string]|any|Element|any}
             */
            ipc.on('selected-directory', (event, path)=> {
                this.show = true
                const name = path[0].slice(path[0].lastIndexOf('/') + 1);
                this.$db.insert({
                    name: name,
                    path: path[0]
                    }, function (err) {
                    if (err) {
                        alert(err)
                    }
                });
                fs.stat(path[0], (err, stats)=> {
                    if (err) {
                        return
                    } else if (stats.isFile()) {
                        if (path[0].slice(-3) == 'jpg' || path[0].slice(-3) == 'png' || path[0].slice(-4) == 'jpeg') {
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
    
                            this.select = true
                        } else {
                            alert('请确保至少有一张图片')
                            location.reload()
                        }
                    } else {
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
                                        
                                        this.select = true
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
                            if (this.imageList.length == 0) {
                                alert('请确保至少有一张图片')
                                location.reload()
                            }
                        })
                    }
                })
            })
        },
    }
</script>

<style lang="less" scoped>
    @import "home";
</style>
