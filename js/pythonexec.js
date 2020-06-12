class blockModule extends HTMLElement {
  constructor(block_type, titre = null) {
    super();
    let template = document.getElementById('mes-blocs');
    this.initial_content = this.innerHTML;
    this.innerHTML = '';
    this.appendChild(template.content.cloneNode(true));
    this.querySelector('.inside').classList.add(block_type);
    this.titre = titre;
    this.loadData();
  }

  loadData() {
    const contenu = this.getAttribute('data-file');
    if (contenu != "" && contenu != null) {
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = (function (elt, xhr) {
        return function (contenu) {
          var DONE = 4; // readyState 4 means the request is done.
          var OK = 200; // status 200 is a successful return.
          if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
              elt.querySelector('.inside').innerHTML = xhr.responseText;
              if (elt.titre != null) {
                elt.querySelector('.inside').prepend(elt.titre);
              }
              var event = new CustomEvent('bloc-loaded');
              elt.dispatchEvent(event);
            }
          }
        };
      }(this, httpRequest));
      httpRequest.open("GET", contenu);
      httpRequest.send();
    } else {
      this.querySelector('.inside').innerHTML = this.initial_content;
      if (this.titre != null) {
        this.querySelector('.inside').prepend(this.titre);
      }
    }
  }
}

/* Classe pour les cours */
class Cours extends blockModule {
  constructor() {
    super('cours');
  }
}

/* Elements custom */
class Attention extends blockModule {
  constructor() {
    let titre = document.createElement('h5');
    titre.innerHTML = '<i class="fas fa-bomb"></i> Attention !';
    super('attention', titre);
  }
}

/* Elements custom */
class Retenir extends blockModule {
  constructor() {
    let titre = document.createElement('h5');
    titre.innerHTML = '<i class="fas fa-brain"></i> À retenir.';
    super('retenir', titre);
  }
}

/* Elements custom */
class Consigne extends blockModule {
  constructor() {
    let titre = document.createElement('h5');
    titre.innerHTML = '<i class="fas fa-cogs"></i> À faire.';
    super('consigne', titre);
  }
}

class MarkdownBlock extends blockModule {
  constructor() {
    super('markdown');
    this.addEventListener(('bloc-loaded'), function (e) {
      this.querySelectorAll('.markdown').forEach((block) => {
        console.log('bloc markdown trouvé');
        var converter = new showdown.Converter(),
        html = converter.makeHtml(block.innerHTML);
        block.innerHTML = html;
      });
    });
    var event = new CustomEvent('bloc-loaded');
    this.dispatchEvent(event);
  }
}

class PythonModule extends HTMLElement {
  constructor() {
    super();
    //preserve inner content
    this.datas = {};
    this.datas.initialPython = this.innerHTML.trim();
    // Empty content
    this.innerHTML = '';
    // clone template
    let myTemplate = document.getElementById('mon-python');
    this.appendChild(myTemplate.content.cloneNode(true));

    function dec2hex(dec) {
      return ('0' + dec.toString(16)).substr(-2);
    }

    // generateId :: Integer -> String
    function generateId(len) {
      var arr = new Uint8Array((len || 40) / 2);
      window.crypto.getRandomValues(arr);
      return Array.from(arr, dec2hex).join('');
    }

    if (this.id == "" || this.id == null) {
      this.id = generateId(16);
    }

    /* Divisions */
    this.tododiv = this.querySelector('[role="consignes"]');
    this.acediv = this.querySelector('[role="editor"]');
    this.pythondiv = this.querySelector('[role="result"]');
    this.pythonoutput = this.querySelector('[role="output"');
    console.log(this.pythonoutput);
    this.pythonoutput.id = this.id + "Console";
    console.log(this.pythonoutput.id);
    this.graphicdiv = this.querySelector('[role="graphic"]');
    this.graphicdiv.id = this.id + "Graphic";
    /* Editor buttons */
    this.downloadButton = this.querySelector('[role="download"]');
    this.restoreButton = this.querySelector('[role="restore"]');
    this.saveButton = this.querySelector('[role="save"]');
    this.reloadButton = this.querySelector('[role="reload"]');
    this.runButton = this.querySelector('[role="run"]');
    /* Tab buttons */
    this.consoleTab = this.querySelector('[aria-controls="console"]');
    this.graphicTab = this.querySelector('[aria-controls="graphic"]');



    this.consoleTab.addEventListener('click', (function (elt) {
      return function (e) {
        elt.pythondiv.classList.add('show', 'active');
        elt.graphicdiv.classList.remove('show', 'active');
        elt.consoleTab.classList.add('active');
        elt.graphicTab.classList.remove('active');
        e.preventDefault();
      };
    })(this));

    this.graphicTab.addEventListener('click', (function (elt) {
      return function (e) {
        console.log(elt);
        elt.pythondiv.classList.remove('show', 'active');
        elt.graphicdiv.classList.add('show', 'active');
        elt.consoleTab.classList.remove('active');
        elt.graphicTab.classList.add('active');
        e.preventDefault();
      };
    })(this));

    function pythonout(elt) {
      return function (txt) {
        //elt.pythondiv.innerHTML = elt.pythondiv.innerHTML + txt;
        elt.pythonoutput.innerHTML = elt.pythonoutput.innerHTML + txt;
      };
    }

    function builtinRead(x) {
      if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[x] === undefined) {
        throw "File not found: '" + x + "'";
      }
      return Sk.builtinFiles.files[x];
    }

    function myRun(elt) {
      return function () {
        (function (elt, prog, mypre) {
          mypre.innerHTML = '';
          Sk.pre = "output";
          Sk.canvas = elt.graphicdiv.id;
          Sk.python3 = true;
          var SkFuture = {
            print_function: true, division: true, absolute_import: null, unicode_literals: true,
            // skulpt specific
            set_repr: false, class_repr: false, inherit_from_object: false, super_args: false,
            // skulpt 1.11.32 specific
            octal_number_literal: true, bankers_rounding: true, python_version: true,
            dunder_next: true, dunder_round: true, exceptions: true, no_long_type: false,
            ceil_floor_int: true,
          };
          Sk.externalLibraries = {
            numpy: {
              path: 'https://cdn.jsdelivr.net/gh/diraison/GenPyExo/external/numpy/__init__.js',
              dependencies: ['https://cdn.jsdelivr.net/gh/diraison/GenPyExo/external/deps/math.js']
            },
            "numpy.random": {
              path: 'https://cdn.jsdelivr.net/gh/diraison/GenPyExo/external/numpy/random/__init__.js'
            },
            matplotlib: {
              path: 'https://cdn.jsdelivr.net/gh/diraison/GenPyExo/external/matplotlib/__init__.js'
            },
            "matplotlib.pyplot": {
              path: 'https://cdn.jsdelivr.net/gh/diraison/GenPyExo/external/matplotlib/pyplot/__init__.js',
              dependencies: ['https://cdn.jsdelivr.net/gh/diraison/GenPyExo/external/deps/d3.min.js']
            },
            pygal: {
              path: 'https://cdn.jsdelivr.net/gh/trinketapp/pygal.js@0.1.4/__init__.js',
              dependencies: ['https://cdn.jsdelivr.net/gh/highcharts/highcharts-dist@6.0.7/highcharts.js',
                'https://cdn.jsdelivr.net/gh/highcharts/highcharts-dist@6.0.7/highcharts-more.js']
            },
            processing: {
              path: 'https://cdn.jsdelivr.net/gh/diraison/GenPyExo/external/processing/__init__.js',
              dependencies: ['https://cdn.jsdelivr.net/gh/diraison/GenPyExo/external/deps/processing.js']
            }
          };

          Sk.configure({
            output: pythonout(elt),
            read: builtinRead,
            __future__: SkFuture,
            killableWhile: true,
            killableFor: true,
            //inputfun : null , // fonction d'entrée personnalisée, voir https://github.com/skulpt/skulpt/issues/685
            //inputfunTakesPrompt:true
          });
          (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = elt.graphicdiv;
          var myPromise = Sk.misceval.asyncToPromise(function () {
            return Sk.importMainWithBody("<stdin>", false, prog, true);
          });
          myPromise.then(function (mod) {
            console.log('Python évalué avec succés');
            elt.graphicdiv.style = ""; //pyplot block style incompatible with bootstrap tabs
          },
            function (err) {
              console.log(err.toString());
              console.log(document.getElementById('errorModal'));
              $('#errorModal .modal-body').html("<pre>" + err.toString() + "</pre>");
              $('#errorModal').modal('show');
            });
        }(elt, elt.editor.getValue(), elt.pythonoutput));
      };
    }

    function mySave(e) {
      return function () {
        (function (elt) {
          if (elt.restoreButton.classList.contains('disabled')) {
            elt.restoreButton.classList.remove('disabled');
          }
          elt.datas.savedPython = elt.editor.getValue();
        }(e));
      };
    }

    function myRestore(elt) {
      return function () {
        (function (elt) {
          elt.editor.setValue(elt.datas.savedPython);
        }(elt));
      };
    }

    function myReload(elt) {
      return function () {
        (function (elt) {
          elt.editor.setValue(elt.datas.initialPython);
        }(elt));
      };
    }

    function myDownload(elt) {
      return function () {
        (function (elt) {
          var blob = new Blob([elt.editor.getValue()], { type: "text/x-python;charset=utf-8" });
          saveAs(blob, "programme.py");
        }(elt));
      };
    }

    //this.acediv.style.minHeight = "20rem";
    this.editor = ace.edit(this.acediv);
    this.editor.setTheme("ace/theme/monokai");
    this.editor.session.setMode("ace/mode/python");
    this.runButton.onclick = myRun(this);
    this.saveButton.onclick = mySave(this);
    this.restoreButton.onclick = myRestore(this);
    this.reloadButton.onclick = myReload(this);
    this.downloadButton.onclick = myDownload(this);

    this.loadPython();
  }

  // Load Python 
  loadPython() {
    const python = this.getAttribute('data-python');
    if (python != "" && python != null) {
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = (function (elt, xhr) {
        return function (data) {
          var DONE = 4; // readyState 4 means the request is done.
          var OK = 200; // status 200 is a successful return.
          if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
              elt.datas.initialPython = xhr.responseText;
              elt.editor.setValue(elt.datas.initialPython);
            }
          }
        };
      }(this, httpRequest));
      httpRequest.open("GET", python);
      httpRequest.send();
    } else {
      this.editor.setValue(this.datas.initialPython)
    }
    if (this.hasAttribute('graphic-first')) {
      this.pythondiv.classList.remove('show', 'active');
      this.graphicdiv.classList.add('show', 'active');
      this.consoleTab.classList.remove('active');
      this.graphicTab.classList.add('active');
    }

    if (this.hasAttribute('small-editor')) {
      this.pythondiv.classList.add('pyexec-small');
      this.graphicdiv.classList.add('pyexec-small');
      this.acediv.classList.add('pyexec-small');
    }

    if (this.hasAttribute('fixed-result')) {
      this.pythondiv.classList.add('pyexec-fixed');
    }
  }

}

/* Chargement des templates */
var httpRequest = new XMLHttpRequest();
httpRequest.onreadystatechange = (function (xhr) {
  return function (data) {
    var DONE = 4; // readyState 4 means the request is done.
    var OK = 200; // status 200 is a successful return.
    if (xhr.readyState === DONE) {
      if (xhr.status === OK) {
        template = document.createElement('templates');
        template.innerHTML = xhr.responseText;
        document.getElementsByTagName('body')[0].prepend(template);
        var event = new CustomEvent('templateLoaded');
        document.dispatchEvent(event);
      }
    }
  };
}(httpRequest));
httpRequest.open("GET", "templates/blocs.html");
httpRequest.send();

/* Création du contenu des modules Python */
document.addEventListener('templateLoaded', function (e) {

  customElements.define('bloc-cours', Cours);
  customElements.define('bloc-attention', Attention);
  customElements.define('bloc-retenir', Retenir);
  customElements.define('bloc-consigne', Consigne);
  customElements.define('bloc-markdown', MarkdownBlock);
  customElements.define('bloc-python', PythonModule);
});

document.addEventListener('bloc-loaded', function (e) {
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightBlock(block);
  });
});
