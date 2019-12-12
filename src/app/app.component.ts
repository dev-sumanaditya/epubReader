import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, HostListener } from '@angular/core';

import * as epub from 'node_modules/epubjs/dist/epub.js';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('viewer') viewer: ElementRef;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    this.handleKeypress(event);
  }
  
  constructor() {}

  ngOnInit() {
    this.savedcfi = localStorage.getItem('cfi');

    
    var content = new epub.hooks(this);
    content.register(function() {})
  }
  
  public isSpread: boolean;
  public isEnd: boolean = false;
  public isStart: boolean = false;
  public chapterList = [];

  public currentProgress: number = 0;
  public currentCfi: string;
  public savedcfi;

  book = new epub("../assets/file.epub");
  rendition = this.book.renderTo("viewer", {flow: "paginated", method: "continuous", width: "100%", height: "90vh"});
  displayed = this.rendition.display();

  ngAfterViewInit() {
    this.displayed.then((renderer) => {
      console.log(this.rendition);
    });

    this.book.ready.then(() => {
      this.book.loaded.navigation.then((toc) => {
        toc.forEach((chapter) => {
          var ch = chapter;
          this.chapterList.push(ch);
        })
      })

      this.book.locations.generate(64); // Generates CFI for every X characters (Characters per/page

      this.go();

      // animation/ adding hooks
      // this.rendition.hooks.register(function(contents){
      //   var loaded = Promise.all([
      //     contents.addStylesheet("http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.css")
      //   ]);
      //   // return loaded promise
      //   return loaded;
      // })
      
    })


    this.rendition.on("layout", function(layout) {
      if (layout.divisor == 2) {
        this.isSpread = true;
      } else {
        this.isSpread = false;
      }
    });

    this.rendition.themes.default({
      h2: {
        'font-size': '42px',
      },
      p: {
        "margin": '10px'
      }
    });


    this.rendition.on("relocated", function(location) {
      this.currentCfi = location.start.cfi;
      localStorage.setItem('cfi', this.currentCfi);

      if(location.atEnd) {
        this.isEnd = true;
      } else {
        this.isEnd = false;
      }

      if(location.atStart) {
        this.isStart = true;
      } else {
        this.isStart = false;
      }

      this.currentProgress = this.book.locations.percentageFromCfi(location.start.cfi);
    })
  }

  public handleKeypress(event) {
    switch (event.keyCode) {
      case 37 : this.prev();
      break;
      
      case 39 : this.next();
      break; 

      case 38 : this.brighten(); 
      break;

      case 40 :this.dim();
      break;

      default: break;
    }
  }

  public prev() {
    this.rendition.prev().then(() => {
      if(this.rendition.location) {
        this.currentCfi = this.rendition.location.start.cfi;
        localStorage.setItem('cfi', this.currentCfi);
      }
    })
  }
  public next() {
    this.rendition.next().then(() => {
      if(this.rendition.location) {
        this.currentCfi = this.rendition.location.start.cfi;
        localStorage.setItem('cfi', this.currentCfi);
      }
    })
  }

  

  public brighten() {};
  public dim() {};


  public changeChapter(url) {
    this.rendition.display(url);
    return false;
  }

  public gotocfi(cfi) {
    this.rendition.display(cfi);
  }

  public go() {
    this.gotocfi(this.savedcfi);
  }
}
