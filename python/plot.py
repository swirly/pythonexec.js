from math import sqrt
import matplotlib.pyplot as plt
from random import seed,randint

def lancerPiece():
    return randint(0,1)

def frequencePiles(n):
    total = 0.0
    for i in range(n):
        if lancerPiece() == 0:
            total += 1
    return total / n

N = 400     # taille des echantillons
p = 0.5     # probabilite

# cadrage du repere et legende
plt.axis([0,100,0,1])
plt.xlabel("100 Échantillons")
plt.ylabel("Fréquence de Piles")
plt.grid()

# frequences des 100 echantillons
X = range(100)
Y = [frequencePiles(N) for i in X]
plt.plot(X, Y, "o")

# bornes de l'intervalle de fluctuation (en rouge)
plt.plot([0,100], [p+1/sqrt(N)]*2, "r")
plt.plot([0,100], [p-1/sqrt(N)]*2, "r")
plt.plot([0,100], [p]*2, "k--")

# affichage
plt.show()
