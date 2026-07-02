import {
  Component, OnInit, inject, signal, computed,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../core/services/assessment.service';
import {
  AnswerResultDto,
  OptionDto,
  QuestionDto,
  QuizDto,
  QuizResultResponse,
} from '../../core/models/quiz.model';

@Component({
  selector: 'app-quiz-take',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCardModule, MatRadioModule, MatCheckboxModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatDividerModule, MatChipsModule,
  ],
  styles: [`
    .quiz-page { max-width: 760px; margin: 32px auto; padding: 0 16px; }

    .quiz-header { margin-bottom: 24px; }
    .quiz-header h1 { font-size: 1.5rem; font-weight: 500; color: #3f51b5; margin: 0 0 6px; }
    .quiz-meta { font-size: 13px; color: #666; display: flex; gap: 16px; flex-wrap: wrap; }

    .question-card { margin-bottom: 20px; }

    .question-num {
      font-size: 11px; font-weight: 600; color: #fff;
      background: #3f51b5; border-radius: 50%;
      width: 24px; height: 24px;
      display: inline-flex; align-items: center; justify-content: center;
      margin-right: 8px; flex-shrink: 0;
    }
    .question-text {
      font-size: 15px; font-weight: 500; color: #222;
      display: flex; align-items: center; flex-wrap: wrap;
    }
    .question-type-badge {
      font-size: 11px; margin-left: 8px; padding: 2px 8px;
      border-radius: 10px; background: #e3f2fd; color: #1565c0; white-space: nowrap;
    }
    .points-badge {
      font-size: 11px; margin-left: 6px; padding: 2px 8px;
      border-radius: 10px; background: #f3e5f5; color: #6a1b9a; white-space: nowrap;
    }

    .options-wrap { margin-top: 16px; }

    /* Radio group layout */
    mat-radio-group { display: flex; flex-direction: column; gap: 8px; }
    mat-radio-button { font-size: 14px; }

    
    .checkbox-group { display: flex; flex-direction: column; gap: 8px; }

    .option-correct   { color: #2e7d32; font-weight: 500; }
    .option-wrong     { color: #c62828; text-decoration: line-through; }
    .option-missed    { color: #e65100; font-style: italic; }

    .result-icon { font-size: 16px; vertical-align: middle; margin-right: 4px; }

    
    .submit-bar {
      display: flex; justify-content: flex-end; gap: 12px;
      margin-top: 8px; padding: 16px 0;
    }

    
    .result-card { text-align: center; padding: 32px 24px; margin-bottom: 24px; }
    .result-card.passed  { background: #e8f5e9; }
    .result-card.failed  { background: #ffebee; }
    .result-icon-big { font-size: 64px; height: 64px; width: 64px; }
    .result-score { font-size: 2.4rem; font-weight: 700; margin: 8px 0 4px; }
    .result-score.passed { color: #2e7d32; }
    .result-score.failed { color: #c62828; }
    .result-label { font-size: 1.1rem; font-weight: 500; margin-bottom: 6px; }
    .result-detail { font-size: 13px; color: #666; }

    .answer-review-card { margin-bottom: 16px; }
    .answer-correct { border-left: 4px solid #4caf50; }
    .answer-wrong   { border-left: 4px solid #f44336; }
    .answer-status-row {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; margin-top: 10px; font-weight: 500;
    }
    .answer-status-row.correct { color: #2e7d32; }
    .answer-status-row.wrong   { color: #c62828; }
    .option-result-item {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; padding: 4px 0;
    }

    .center { display: flex; justify-content: center; padding: 80px; }
    .error-msg { color: #c62828; text-align: center; padding: 40px; }
  `],
  template: `
    @if (loading()) {
      <div class="center"><mat-spinner diameter="48" /></div>
    } @else if (error()) {
      <div class="error-msg">
        <mat-icon style="font-size:48px;height:48px;width:48px;">error_outline</mat-icon>
        <p>{{ error() }}</p>
        <button mat-stroked-button routerLink="/home">На главную</button>
      </div>
    } @else if (result()) {
      <div class="quiz-page">

        <mat-card class="result-card" [class.passed]="result()!.passed" [class.failed]="!result()!.passed">
          <mat-icon class="result-icon-big" [style.color]="result()!.passed ? '#2e7d32' : '#c62828'">
            {{ result()!.passed ? 'emoji_events' : 'sentiment_dissatisfied' }}
          </mat-icon>
          <div class="result-score" [class.passed]="result()!.passed" [class.failed]="!result()!.passed">
            {{ result()!.percentage }}%
          </div>
          <div class="result-label">
            {{ result()!.passed ? 'Тест пройден!' : 'Тест не пройден' }}
          </div>
          <div class="result-detail">
            Набрано {{ result()!.earnedPoints }} из {{ result()!.totalPoints }} баллов
            &nbsp;·&nbsp; Проходной балл: {{ result()!.passingScore }}%
          </div>
        </mat-card>

        <h3 style="margin:0 0 12px;font-size:1rem;color:#333;">Разбор ответов</h3>

        @for (ans of result()!.answers; track ans.questionId; let i = $index) {
          <mat-card
            class="answer-review-card"
            [class.answer-correct]="ans.correct"
            [class.answer-wrong]="!ans.correct"
          >
            <mat-card-content style="padding-top:16px;">

              <div class="question-text">
                <span class="question-num">{{ i + 1 }}</span>
                {{ ans.questionText }}
                <span class="points-badge">
                  {{ ans.pointsEarned }} / {{ ans.pointsPossible }} б.
                </span>
              </div>

              <div style="margin-top:12px;">
                @for (opt of optionsForReview(ans); track opt.id) {
                  <div class="option-result-item">
                    <mat-icon style="font-size:18px;width:18px;height:18px;"
                      [style.color]="opt.iconColor">{{ opt.icon }}</mat-icon>
                    <span [style.color]="opt.textColor">{{ opt.text }}</span>
                    @if (opt.tag) {
                      <span style="font-size:11px;color:#888;margin-left:4px;">({{ opt.tag }})</span>
                    }
                  </div>
                }
              </div>

              <div class="answer-status-row" [class.correct]="ans.correct" [class.wrong]="!ans.correct">
                <mat-icon style="font-size:16px;width:16px;height:16px;">
                  {{ ans.correct ? 'check_circle' : 'cancel' }}
                </mat-icon>
                {{ ans.correct ? 'Верно' : 'Неверно' }}
              </div>

            </mat-card-content>
          </mat-card>
        }

        <div class="submit-bar">
          <button mat-stroked-button (click)="retake()">
            <mat-icon>replay</mat-icon> Пройти снова
          </button>
          <button mat-flat-button color="primary" routerLink="/home">
            <mat-icon>home</mat-icon> На главную
          </button>
        </div>

      </div>

    } @else if (quiz()) {
      <div class="quiz-page">

        <div class="quiz-header">
          <button mat-button (click)="goBack()" style="margin-bottom:8px;">
            <mat-icon>arrow_back</mat-icon> Назад
          </button>
          <h1>{{ quiz()!.title }}</h1>
          @if (quiz()!.description) {
            <p style="color:#555;margin:0 0 8px;">{{ quiz()!.description }}</p>
          }
          <div class="quiz-meta">
            <span><mat-icon style="font-size:15px;vertical-align:middle;">quiz</mat-icon>
              {{ quiz()!.totalQuestions }} вопросов</span>
            <span><mat-icon style="font-size:15px;vertical-align:middle;">star</mat-icon>
              {{ quiz()!.totalPoints }} баллов</span>
            <span><mat-icon style="font-size:15px;vertical-align:middle;">flag</mat-icon>
              Проходной балл: {{ quiz()!.passingScore }}%</span>
            @if (quiz()!.timeLimitMinutes) {
              <span><mat-icon style="font-size:15px;vertical-align:middle;">timer</mat-icon>
                {{ quiz()!.timeLimitMinutes }} мин.</span>
            }
          </div>
        </div>

        @for (question of quiz()!.questions; track question.id; let i = $index) {
          <mat-card class="question-card">
            <mat-card-content style="padding-top:16px;">

              <div class="question-text">
                <span class="question-num">{{ i + 1 }}</span>
                {{ question.text }}
                <span class="question-type-badge">
                  {{ question.type === 'SINGLE_CHOICE' ? 'Один ответ' : 'Несколько ответов' }}
                </span>
                <span class="points-badge">{{ question.points }} б.</span>
              </div>

              <div class="options-wrap">

                @if (question.type === 'SINGLE_CHOICE') {
                  <!-- RADIO GROUP для вопроса с одним ответом -->
                  <mat-radio-group
                    [ngModel]="getSingleAnswer(question.id)"
                    (ngModelChange)="setSingleAnswer(question.id, $event)"
                  >
                    @for (opt of question.options; track opt.id) {
                      <mat-radio-button [value]="opt.id">
                        {{ opt.text }}
                      </mat-radio-button>
                    }
                  </mat-radio-group>
                }

                @if (question.type === 'MULTIPLE_CHOICE') {
                  <div class="checkbox-group">
                    @for (opt of question.options; track opt.id) {
                      <mat-checkbox
                        [checked]="isChecked(question.id, opt.id)"
                        (change)="toggleCheckbox(question.id, opt.id, $event.checked)"
                      >
                        {{ opt.text }}
                      </mat-checkbox>
                    }
                  </div>
                }

              </div>
            </mat-card-content>
          </mat-card>
        }

        <div class="submit-bar">
          <span style="font-size:13px;color:#666;align-self:center;">
            Отвечено: {{ answeredCount() }} / {{ quiz()!.totalQuestions }}
          </span>
          <button
            mat-flat-button
            color="primary"
            [disabled]="submitting() || answeredCount() === 0"
            (click)="submit()"
          >
            @if (submitting()) {
              <mat-spinner diameter="20" style="display:inline-block;margin-right:8px;" />
            } @else {
              <mat-icon>send</mat-icon>
            }
            Отправить ответы
          </button>
        </div>

      </div>
    }
  `,
})
export class QuizTakeComponent implements OnInit {
  private readonly route      = inject(ActivatedRoute);
  private readonly router     = inject(Router);
  private readonly assessment = inject(AssessmentService);

  readonly loading    = signal(true);
  readonly error      = signal<string | null>(null);
  readonly quiz       = signal<QuizDto | null>(null);
  readonly result     = signal<QuizResultResponse | null>(null);
  readonly submitting = signal(false);

  private readonly singleAnswers = signal<Map<string, string>>(new Map());
  private readonly multiAnswers  = signal<Map<string, Set<string>>>(new Map());

  readonly answeredCount = computed(() => {
    const q = this.quiz();
    if (!q) return 0;
    return q.questions.filter(question => {
      if (question.type === 'SINGLE_CHOICE') {
        return this.singleAnswers().has(question.id);
      }
      const sel = this.multiAnswers().get(question.id);
      return sel && sel.size > 0;
    }).length;
  });

  ngOnInit(): void {
    const quizId = this.route.snapshot.paramMap.get('quizId')!;
    this.assessment.getQuiz(quizId).subscribe({
      next:  quiz  => { this.quiz.set(quiz);  this.loading.set(false); },
      error: err   => {
        this.error.set(err.status === 404 ? 'Тест не найден.' : 'Ошибка загрузки теста.');
        this.loading.set(false);
      },
    });
  }


  getSingleAnswer(questionId: string): string | null {
    return this.singleAnswers().get(questionId) ?? null;
  }

  setSingleAnswer(questionId: string, optionId: string): void {
    this.singleAnswers.update(m => new Map(m).set(questionId, optionId));
  }


  isChecked(questionId: string, optionId: string): boolean {
    return this.multiAnswers().get(questionId)?.has(optionId) ?? false;
  }

  toggleCheckbox(questionId: string, optionId: string, checked: boolean): void {
    this.multiAnswers.update(m => {
      const next = new Map(m);
      const set  = new Set(next.get(questionId) ?? []);
      checked ? set.add(optionId) : set.delete(optionId);
      next.set(questionId, set);
      return next;
    });
  }


  submit(): void {
    const q = this.quiz();
    if (!q) return;

    const answers = q.questions.map(question => {
      if (question.type === 'SINGLE_CHOICE') {
        const sel = this.singleAnswers().get(question.id);
        return { questionId: question.id, selectedOptionIds: sel ? [sel] : [] };
      }
      const sel = this.multiAnswers().get(question.id);
      return { questionId: question.id, selectedOptionIds: sel ? Array.from(sel) : [] };
    });

    this.submitting.set(true);
    this.assessment.submitQuiz(q.id, { answers }).subscribe({
      next: res => {
        this.result.set(res);
        this.submitting.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => {
        this.submitting.set(false);
        this.error.set('Ошибка при отправке ответов. Попробуйте ещё раз.');
      },
    });
  }

  retake(): void {
    this.result.set(null);
    this.singleAnswers.set(new Map());
    this.multiAnswers.set(new Map());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }


  optionsForReview(ans: AnswerResultDto): ReviewOption[] {
    const q = this.quiz();
    if (!q) return [];

    const question = q.questions.find(qu => qu.id === ans.questionId);
    if (!question) return [];

    const correctSet  = new Set(ans.correctOptionIds);
    const selectedSet = new Set(ans.selectedOptionIds);

    return question.options.map((opt: OptionDto): ReviewOption => {
      const isCorrect  = correctSet.has(opt.id);
      const isSelected = selectedSet.has(opt.id);

      if (isCorrect && isSelected) {
        return { id: opt.id, text: opt.text, icon: 'check_circle', iconColor: '#2e7d32', textColor: '#2e7d32', tag: 'Ваш ответ · верно' };
      }
      if (isCorrect && !isSelected) {
        return { id: opt.id, text: opt.text, icon: 'radio_button_checked', iconColor: '#e65100', textColor: '#e65100', tag: 'Правильный ответ' };
      }
      if (!isCorrect && isSelected) {
        return { id: opt.id, text: opt.text, icon: 'cancel', iconColor: '#c62828', textColor: '#c62828', tag: 'Ваш ответ · неверно' };
      }
      return { id: opt.id, text: opt.text, icon: 'radio_button_unchecked', iconColor: '#bdbdbd', textColor: '#888', tag: null };
    });
  }
}

interface ReviewOption {
  id: string;
  text: string;
  icon: string;
  iconColor: string;
  textColor: string;
  tag: string | null;
}