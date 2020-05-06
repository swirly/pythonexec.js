class PythonModule extends HTMLElement {
  constructor() {
    super();
    // clone template
    let myTemplate = document.getElementById('mon-python');
    this.appendChild(myTemplate.content.cloneNode(true));

    /* Divisions */
    this.tododiv = this.querySelector('[role="consignes"]');
    this.acediv = this.querySelector('[role="editor"]');
    this.pythondiv = this.querySelector('[role="result"]');
    this.pythonoutput = this.querySelector('[role="output"');
    this.graphicdiv = this.querySelector('[role="graphic"]');
    /* Editor buttons */
    this.downloadButton = this.querySelector('[role="download"]');
    this.restoreButton = this.querySelector('[role="restore"]');
    this.saveButton = this.querySelector('[role="save"]');
    this.reloadButton = this.querySelector('[role="reload"]');
    this.runButton = this.querySelector('[role="run"]');
    /* Tab buttons */
    this.consoleTab = this.querySelector('[aria-controls="console"]');
    this.graphicTab = this.querySelector('[aria-controls="graphic"]');
    this.datas = {};


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

    // Load Python 
    function loadPython(elt) {
      const python = elt.getAttribute('data-python');
      if (python != "") {
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
        }(elt, httpRequest));
        httpRequest.open("GET", python);
        httpRequest.send();
      }
    }

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
          Sk.canvas = "graphic";
          Sk.python3 = true;
          var SkFuture = {
            print_function: true, division: true, absolute_import: null, unicode_literals: true,
            // skulpt specific
            set_repr: false, class_repr: false, inherit_from_object: false, super_args: false,
            // skulpt 1.11.32 specific
            octal_number_literal: true,bankers_rounding: true, python_version: true,
            dunder_next : true,dunder_round: true,exceptions: true, no_long_type: false,
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
            __future__:SkFuture, 
            killableWhile:true, 
            killableFor:true,
            //inputfun : null , // fonction d'entrée personnalisée, voir https://github.com/skulpt/skulpt/issues/685
            //inputfunTakesPrompt:true
          });
          (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = elt.graphicdiv;
          var myPromise = Sk.misceval.asyncToPromise(function () {
            return Sk.importMainWithBody("<stdin>", false, prog, true);
          });
          myPromise.then(function (mod) {
            console.log('Python évalué avec succés');
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

    function mySave(elt) {
      return function () {
        (function (elt) {
          if (elt.restoreButton.classList.contains('disabled')) {
            elt.restoreButton.classList.remove('disabled');
          }
          elt.datas.savedPython = elt.editor.getValue();
        }(elt));
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

    loadPython(this);
  }

}

/* Classe pour les cours */
class Cours extends HTMLElement {
  constructor() {
    super();
    let template = document.getElementById('mes-blocs');
    console.log(template);
    let text = this.innerHTML;
    this.innerHTML = '';
    this.appendChild(template.content.cloneNode(true));
    this.querySelector('.inside').classList.add('cours');
    this.querySelector('.inside').innerHTML = text;
  }
}

/* Elements custom */
class Attention extends HTMLElement {
  constructor() {
    super();
    let template = document.getElementById('mes-blocs');
    console.log(template);
    let text = this.innerHTML;
    this.innerHTML = '';
    this.appendChild(template.content.cloneNode(true));
    this.querySelector('.inside').classList.add('attention');
    this.querySelector('.inside').innerHTML = text;
    let titre = document.createElement('h5');
    titre.innerHTML = '<i class="fas fa-bomb"></i> Attention !';
    this.querySelector('.inside').prepend(titre);
  }
}

/* Elements custom */
class Retenir extends HTMLElement {
  constructor() {
    super();
    let template = document.getElementById('mes-blocs');
    console.log(template);
    let text = this.innerHTML;
    this.innerHTML = '';
    this.appendChild(template.content.cloneNode(true));
    this.querySelector('.inside').classList.add('retenir');
    this.querySelector('.inside').innerHTML = text;
    let titre = document.createElement('h5');
    titre.innerHTML = '<i class="fas fa-brain"></i> À retenir.';
    this.querySelector('.inside').prepend(titre);
  }
}

/* Elements custom */
class Consigne extends HTMLElement {
  constructor() {
    super();

    function loadData(elt) {
      const todo = elt.getAttribute('data');
      console.log(todo);
      if (todo != "" && todo != null) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = (function (elt, xhr) {
          return function (data) {
            var DONE = 4; // readyState 4 means the request is done.
            var OK = 200; // status 200 is a successful return.
            if (xhr.readyState === DONE) {
              if (xhr.status === OK) {
                elt.querySelector('.inside').innerHTML = xhr.responseText;
                var event = new CustomEvent('bloc-python-loaded');
                document.dispatchEvent(event);
                elt.querySelector('.inside').prepend(elt.titre);
              }
            }
          };
        }(elt, httpRequest));
        httpRequest.open("GET", todo);
        httpRequest.send();
      } else {
        elt.querySelector('.inside').innerHTML = elt.text;
        elt.querySelector('.inside').prepend(elt.titre);
      }
    }

    let template = document.getElementById('mes-blocs');
    console.log(template);
    this.text = this.innerHTML;
    this.titre = document.createElement('h5');
    this.titre.innerHTML = '<i class="fas fa-cogs"></i> À faire.';


    this.innerHTML = '';
    this.appendChild(template.content.cloneNode(true));
    this.querySelector('.inside').classList.add('consigne');

    loadData(this);


  }
}

/* Chargement du template pour le module Python */
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
  customElements.define('bloc-python', PythonModule);
  customElements.define('bloc-cours', Cours);
  customElements.define('bloc-attention', Attention);
  customElements.define('bloc-retenir', Retenir);
  customElements.define('bloc-consigne', Consigne);
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightBlock(block);
  });
});

document.addEventListener('bloc-python-loaded', function (e) {
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightBlock(block);
  });
});
