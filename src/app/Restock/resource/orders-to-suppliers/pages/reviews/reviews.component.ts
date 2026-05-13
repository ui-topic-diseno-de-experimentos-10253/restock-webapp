import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface Review {
  restaurant: string;
  rating: number;
  comment: string;
  date: string;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css'
})
export class ReviewsComponent implements AfterViewInit {

  displayedColumns: string[] = ['restaurant', 'rating', 'comment', 'date'];
  dataSource = new MatTableDataSource<Review>(
    [
      { restaurant: 'Punto Limon', rating: 5, comment: 'Excellent supplier, the products arrived in perfect condition and on time. Very satisfied with the overall service and packaging.', date: '16/04/2025' },
      { restaurant: 'Amazonas Restaurant', rating: 3, comment: 'Good supplier, although this time some items arrived a bit late. Quality was acceptable but could be improved.', date: '16/04/2025' },
      { restaurant: 'Cebiche Peru', rating: 5, comment: 'Everything arrived fresh and well-packed. The fish was in perfect condition. We will definitely order again.', date: '16/04/2025' },
      { restaurant: 'Sabor y Postres', rating: 2, comment: 'The experience was okay, but several products did not meet the freshness standards we expected.', date: '16/04/2025' },
      { restaurant: 'Lincon Restaurant', rating: 4, comment: 'High-quality products with great presentation. You can tell they care about logistics and customer satisfaction.', date: '16/04/2025' },
      { restaurant: 'El Mariachi', rating: 4, comment: 'Good quality items and proper packaging. The supplier was responsive and answered all our inquiries quickly.', date: '16/04/2025' },
      { restaurant: 'La cantina', rating: 5, comment: 'Excellent delivery, great packaging, and top-notch customer service. Everything arrived fresh and in order.', date: '16/04/2025' },
      { restaurant: 'Sabor Azteca', rating: 4, comment: 'Quality was good, though one package had a damaged seal. The issue was reported and they handled it well.', date: '16/04/2025' },
      { restaurant: 'El Sombrero', rating: 5, comment: 'All products arrived in good condition and within the scheduled time. Very reliable and professional.', date: '16/04/2025' },
      { restaurant: 'La Taquería', rating: 4, comment: 'Good quality and on-time delivery. Order tracking could be improved, but overall it was a positive experience.', date: '14/04/2025' },
      { restaurant: 'El Guacamole', rating: 4, comment: 'Great attention and product quality. They followed up during the process to ensure everything was correct.', date: '14/04/2025' },
      { restaurant: 'La Fiesta Mexicana', rating: 5, comment: 'Excellent service and fresh products. The personalized support was a big plus. Will definitely order again.', date: '13/04/2025' }
    ]

  );

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  get averageReview(): number {
    const total = this.dataSource.data.reduce((acc, val) => acc + val.rating, 0);
    return this.dataSource.data.length ? parseFloat((total / this.dataSource.data.length).toFixed(1)) : 0;
  }
}
