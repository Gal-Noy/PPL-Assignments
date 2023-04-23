; (define take
;   (lambda (lst pos)
;     (if (= pos 0)
;       '()
;       (if (empty? lst)
;         '()
;         (cons (car lst) (take (cdr lst) (- pos 1))))))
;   )

; (define take-map
;   (lambda (lst func pos)
;     (if (= pos 0)
;       '()
;       (if (empty? lst)
;         '()
;         (cons (func (car lst)) (take-map (cdr lst) func (- pos 1))))))
;   )

; (define take-filter
;   (lambda (lst pred pos)
;     (if (= pos 0)
;       '()
;       (if (empty? lst)
;         '()
;         (if (pred (car lst))
;           (cons (car lst) (take-filter (cdr lst) pred (- pos 1)))
;           (take-filter (cdr lst) pred pos))))))

(define count-node
  (lambda (tree val)
    (if (empty? tree)
      0
      (if (= (root tree) val)
        (+ 1 (count-node (cdr tree) val))
        (if (pair? (root tree))
          (+ (count-node ((right tree) val)) (count-node ((left tree) val)))
          (count-node (cdr tree) val))
      )
    )
  )
 )

(define count-node
  (lambda (tree val)
    (if (pair? tree)
      (+ (if (= (root tree) val) 1 0) (+ (count-node (right tree) val) (count-node (left tree) val)))
      (if (= tree val) 1 0))
  )
 )

#lang racket

(display (= (length '') 0))