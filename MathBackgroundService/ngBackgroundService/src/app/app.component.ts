import { AccountService } from './services/account.service';
import { Component, NgZone } from '@angular/core';
import { environment } from 'src/environments/environment';

// On doit commencer par ajouter signalr dans les node_modules: npm install @microsoft/signalr
// Ensuite on inclut la librairie
import * as signalR from '@microsoft/signalr';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FormsModule } from '@angular/forms';

enum Operation {
  Add,
  Substract,
  Multiply,
}

interface MathQuestion {
  operation: Operation;
  valueA: number;
  valueB: number;
  answers: number[];
  playerChoices: number[];
}

interface PlayerInfoDTO {
  nbRightAnswers: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatBadgeModule,
  ],
})
export class AppComponent {
  title = 'ngBackgroundService';

  baseUrl = environment.apiUrl;

  nbRightAnswers = 0;

  private hubConnection?: signalR.HubConnection;

  isConnected = false;
  selection = -1;

  currentQuestion: MathQuestion | null = null;

  constructor(public account: AccountService, private zone: NgZone) {}

  selectChoice(choice: number) {
    this.selection = choice;
    this.hubConnection!.invoke('SelectChoice', choice);
  }

  async register() {
    try {
      await this.account.register();
    } catch (e) {
      alert("Erreur pendant l'enregistrement!!!!!");
      return;
    }
    alert("L'enregistrement a été un succès!");
  }

  async login() {
    await this.account.login();
  }

  async logout() {
    await this.account.logout();

    if (this.hubConnection?.state == signalR.HubConnectionState.Connected)
      this.hubConnection.stop();
    this.isConnected = false;
  }

  isLoggedIn(): Boolean {
    return this.account.isLoggedIn();
  }

  connectToHub() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.baseUrl + 'game', {
        accessTokenFactory: () => sessionStorage.getItem('token')!,
      })
      .build();

    if (!this.hubConnection) return;

    this.hubConnection.on('PlayerInfo', (data: PlayerInfoDTO) => {
      this.zone.run(() => {
        console.log(data);
        this.isConnected = true;
        this.nbRightAnswers = data.nbRightAnswers;
      });
    });

    this.hubConnection.on('CurrentQuestion', (data: MathQuestion) => {
      this.zone.run(() => {
        console.log(data);
        this.selection = -1;
        this.currentQuestion = data;
      });
    });

    this.hubConnection.on('IncreasePlayersChoices', (choiceIndex: number) => {
      this.zone.run(() => {
        if (this.currentQuestion) {
          this.currentQuestion.playerChoices[choiceIndex]++;
        }
      });
    });

  this.hubConnection.on('RightAnswer', () => {
      this.zone.run(() => {
        this.nbRightAnswers++;
        alert('Bonne réponse !');
      });
    });

    this.hubConnection.on('WrongAnswer', (rightAnswer: number) => {
      this.zone.run(() => {
        alert('Mauvaise réponse ! La bonne réponse était ' + rightAnswer);
      });
    });


    this.hubConnection
      .start()
      .then(() => {
        console.log('Connected to Hub');
      })
      .catch((err) => console.log('Error while starting connection: ' + err));
  }
}
