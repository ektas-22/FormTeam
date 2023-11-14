import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import userData from '../data/data.json';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-user-list',
  standalone: true,
  // changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  currentPage = 1;
  itemsPerPage = 20;
  searchName = '';
  filters = {
    domain: '',
    gender: '',
    availability: '',
  };
  showTeamDetails = false;
  teamDetails: any;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.filteredUsers = userData.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const searchQuery = this.searchName.toLowerCase();
      const nameMatch = fullName.includes(searchQuery);
      const domainMatch = !this.filters.domain || user.domain === this.filters.domain;
      const genderMatch = !this.filters.gender || user.gender === this.filters.gender;
      const availabilityMatch = !this.filters.availability || user.available === (this.filters.availability === 'Available');

      return nameMatch && domainMatch && genderMatch && availabilityMatch;
    });

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.users = this.filteredUsers.slice(startIndex, endIndex);
  }

  nextPage(): void {
    this.currentPage++;
    this.loadUsers();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  openTeamCreationErrorDialog(message: string): void {
    alert(`Error: ${message}`);
  }

  createTeam(): void {
    const selectedUsers = this.filteredUsers.filter(user => user.selected);
    const selectedAvailableUsers = selectedUsers.filter(user => user.available);
  
    if (selectedAvailableUsers.length > 0 && selectedAvailableUsers.length === selectedUsers.length) {
      const uniqueDomains = Array.from(new Set(selectedAvailableUsers.map(user => user.domain)));
  
      if (uniqueDomains.length === 1) {
        const teamDetails = {
          members: selectedAvailableUsers,
          domain: uniqueDomains[0],
        };
  
        this.showTeamDetails = true;
        this.teamDetails = teamDetails;
  
        selectedAvailableUsers.forEach(user => (user.selected = false));
      } else {
        this.openTeamCreationErrorDialog('Users belong to different domains');
      }
    } else {
      this.openTeamCreationErrorDialog('No users selected, or some selected users are not available');
    }
  }
  
  closeTeamDetails(): void {
    this.showTeamDetails = false;
  }  
    
  getUniqueDomains(): string[] {
    return Array.from(new Set(this.filteredUsers.map((user) => user.domain)));
  }
}