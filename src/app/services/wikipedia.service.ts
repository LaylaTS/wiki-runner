import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export interface WikipediaPage {
  title: string;
  content: string;
  links: string[];
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class WikipediaService {
  private baseUrl = 'https://en.wikipedia.org/api/rest_v1';
  private apiUrl = 'https://en.wikipedia.org/w/api.php';

  constructor(private http: HttpClient) {}

  getRandomArticle(): Observable<string> {
    const params = {
      action: 'query',
      format: 'json',
      list: 'random',
      rnnamespace: '0',
      rnlimit: '1',
      origin: '*'
    };

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => response.query.random[0].title)
    );
  }

  searchArticles(query: string): Observable<string[]> {
    const params = {
      action: 'opensearch',
      search: query,
      limit: '10',
      namespace: '0',
      format: 'json',
      origin: '*'
    };

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => response[1])
    );
  }

  getArticle(title: string): Observable<WikipediaPage> {
    const contentUrl = `${this.baseUrl}/page/html/${encodeURIComponent(title)}`;
    const linksUrl = `${this.apiUrl}?action=query&format=json&prop=links&titles=${encodeURIComponent(title)}&pllimit=500&origin=*`;

    return forkJoin({
      content: this.http.get(contentUrl, { responseType: 'text' }),
      links: this.http.get<any>(linksUrl)
    }).pipe(
      map(({ content, links }) => {
        const pageId = Object.keys(links.query.pages)[0];
        const pageLinks = links.query.pages[pageId].links || [];
        
        return {
          title,
          content: this.processContent(content),
          links: pageLinks.map((link: any) => link.title),
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
        };
      })
    );
  }

  private processContent(html: string): string {
    // Remove Wikipedia-specific elements that we don't want
    let processed = html
      .replace(/<figure[^>]*class="[^"]*mbox[^"]*"[^>]*>[\s\S]*?<\/figure>/gi, '')
      .replace(/<div[^>]*class="[^"]*navbox[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<table[^>]*class="[^"]*infobox[^"]*"[^>]*>[\s\S]*?<\/table>/gi, '')
      .replace(/<div[^>]*class="[^"]*hatnote[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<sup[^>]*class="[^"]*reference[^"]*"[^>]*>[\s\S]*?<\/sup>/gi, '')
      .replace(/<span[^>]*class="[^"]*mw-editsection[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');

    return processed;
  }
}
