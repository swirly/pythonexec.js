# pythonexec.js

## contexte

L'enseignement de NSI au lycée est orienté vers le langage Python. Les élèves doivent pouvoir s'approprier le langage dans un premier temps sans avoir à se soucier de l'environnement de développement (choix de l'éditeur, éxécution des programmes, etc).

La solution la plus simple est d'avoir un environnement qui permette d'utiliser Python dans le navigateur. Fournir le lien suffit alors pour que les élèves aient accès aux activités.

Il existe différentes solutions à l'heure actuelle pour fournir un environnement Python dans un navigateur. On peut en distinguer principalement deux sur le principe :

* les solutions qui permettent de lancer un exécutable python sur un serveur et qui affiche le résultat en utilisant en général un kernel iPython. Dans cette famille de solution, on trouve en particulier les Jupyter Notebook. Ces solutions permettent d'avoir un environnement python complet. Elles ont par contre l'inconvénient de nécessiter la mise en place d'une infrastructure importante dont la gestion n'est pas toujours évidente.

* les solutions basées sur le transpilage. On convertit le langage Python vers javascript. Cette solution n'est pas toujours simple à mettre en oeuvre. Javascript est à la base un langage fonctionnel à prototype, là ou Python est un langage objet impératif. Cette différence de paradigme n'est pas anodine. Le [projet skulpt](https://skulpt.org/) est assez abouti sur le sujet. Il est en particulier utilisé par [trinket](https://trinket.io/)

## Pourquoi pythonexec.js ?

Skulpt n'est pas toujours facile à mettre en œuvre. Pythonexec est juste une libraire qui est orientée vers l'enseignement et permet de mettre en œuvre facilement Skulpt, avec quelques ajouts en terme de style destinées spécifiquement à l'enseignement.

### Installation

*todo*

### Création de pages

*todo*
