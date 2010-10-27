{-# OPTIONS -XExistentialQuantification #-}
--
-- This is a quick-and-dirty Haskell script for convering docs/manual.txt from
-- the GoogleCode wiki format to LaTeX. It contains a fairly complete parser
-- for the wiki format, but should only be expected to give good results with
-- docs/manual.txt.
--
-- Compile like this:
--
--     ghc GoCoWiToTex.hs -o executable_name -package parsec -package mtl
--
-- Then run like this:
--
--     executable_name foo.txt IBEX_VERSION > output.tex
--
-- (Get GHC at http://www.haskell.org/ghc/)
--
-- The tex file should compile using 'pdflatex' with a standard LaTeX install.
-- Edit the 'preamble' definition below to change general formatting/layout options.
-- 
module Main where

import IO
import Data.List
import Debug.Trace
import System (getArgs)
import qualified Text.ParserCombinators.Parsec as P
import Control.Monad.State
import Char

---------- CONFIGURABLE OPTIONS ----------
preamble = " \\documentclass[11pt,letterpaper]{article}\n\
           \ \\usepackage{parskip}\n\
           \ \\usepackage[left=1.0in,right=1.0in,top=1.0in,bottom=1.0in]{geometry}\n\
           \ \\usepackage[T1]{fontenc}\n\
           \ \\usepackage[sc]{mathpazo}\n\
           \ \\usepackage{sectsty}\n\
           \ \\usepackage{verbatim}\n\
           \ \\usepackage{ulem}\n\
           \ \\usepackage{hyperref}\n\
           \ \\sectionfont{\\large \\bf}\n\
           \ \\subsectionfont{\\normalsize \\bf}\n\
           \ \\subsubsectionfont{\\normalsize \\it}\n"

verbatimMaxLineLength = 95
availablePageWidthIn = 6.5 :: Float
author = "Alex Drummond"
------------------------------------------

capLines :: String -> String
capLines s = concat (intersperse "\n" (map ns (lines s)))
  where mll = verbatimMaxLineLength
        ns xs = (take mll xs) ++ (case drop mll xs of
                                    [] -> []
                                    ys -> '\n' : ns ys)

escapeTexChar c =
  case c of
    '\\' -> "\\textbackslash"
    '%'  -> "\\%"
    '~'  -> "\\textasciitilde"
    '{'  -> "\\{"
    '}'  -> "\\}"
    '['  -> "{[}"
    ']'  -> "{]}"
    '$'  -> "\\$"
    '&'  -> "\\&"
    '_'  -> "\\_"
    '#'  -> "\\#"
    _    -> [c]

removeBangs :: String -> String
removeBangs cs = rec (span (/= '!') cs)
  where rec (b4, []) = cs
        rec (b4, (c:cs)) = b4 ++ stripBang cs
          where stripBang "" = ""
                stripBang (c:cs)
                  | isAlphaNum c = removeBangs (dropWhile isAlphaNum cs)
                  | True         = "!" ++ removeBangs cs

data TexifyState = TexifyState {
  _squoteOpen :: Bool,
  _dquoteOpen :: Bool
}
type TexifyStateM = State TexifyState String

class Show a => Node_ a where
  texify :: a -> TexifyStateM

data Node = forall a . Node_ a => Node a

texifyNode :: Node -> String
texifyNode (Node n) = evalState (texify n) (TexifyState { _squoteOpen = False, _dquoteOpen = False })

concatMapM :: Monad m => (a -> m [b]) -> [a] -> m [b]
concatMapM f xs = liftM concat $ mapM f xs

texescape :: String -> TexifyStateM
texescape s = concatMapM f s
  where f c = case c of
                '\'' -> do
                  modify (\s -> s { _squoteOpen = not (_squoteOpen s) })
                  s <- get
                  return (if (_squoteOpen s) then "`" else "'")
                '"' -> do
                  modify (\s -> s { _dquoteOpen = not (_dquoteOpen s) })
                  s <- get
                  return (if (_dquoteOpen s) then "``" else "''")
                _ -> return (escapeTexChar c)

texescape' = concatMap escapeTexChar

instance Show Node where
  show (Node x) = show x

data Heading = Heading { _level :: Int, _title :: String } deriving Show
data ParagraphBreak = ParagraphBreak deriving Show
data Literal = Literal { _contents :: String } deriving Show
data Text = Text { _text :: String, _style :: Style } deriving Show
data Style = Style {
    _bold :: Bool,
    _italic :: Bool,
    _inline :: Bool,
    _strikeout :: Bool,
    _superscript :: Bool,
    _subscript :: Bool
} deriving Show
plainStyle = Style {
    _bold = False,
    _italic = False,
    _inline = False,
    _strikeout = False,
    _superscript = False,
    _subscript = False
}
data Bullets = Bullets [[Text]] deriving Show
data Numbered = Numbered [[Text]] deriving Show
data Table = Table [[[Text]]] deriving Show

data MultiNode = forall a . Node_ a => MultiNode [a]
instance Show MultiNode where
  show (MultiNode xs) = concatMap show xs

instance Node_ MultiNode where
  texify (MultiNode n) = concatMapM texify n

instance Node_ Heading where
  texify n = do
    t <- texescape (_title n)
    return $ "\\" ++ (take (((_level n)-1)*3) (cycle "sub")) ++ "section{" ++ t ++ "}\n"

instance Node_ ParagraphBreak where
  texify pb = modify (\s -> s { _squoteOpen = False, _dquoteOpen = False }) >>
              return "\n\n"

instance Node_ Literal where
  texify l = return $ "\\footnotesize\\begin{verbatim}\n" ++ capLines (_contents l) ++ "\n\\end{verbatim}\n\\normalsize\n"

preds = [ (_bold, ("\\textbf{", "}")),
          (_italic, ("\\textit{", "}")),
          (_inline, ("\\texttt{", "}")),
          (_superscript, ("$^{\\mbox{\\footnotesize ", "}}$")),
          (_subscript, ("$_{\\mbox{\\footnotesize ", "}}$")),
          (_strikeout, ("\\sout{", "}")) ]

instance Node_ Text where
  texify t = do
    txt <- texescape (_text t)
    return $
      concatMap (\(p, (s, e)) -> if p (_style t) then s else "") preds ++
      txt ++
      concatMap (\(p, (s, e)) -> if p (_style t) then e else "") preds

instance Node_ Bullets where
  texify (Bullets bs) = concatMapM (\b -> do { r <- concatMapM texify b
                                             ; return $ "\n\\item\n" ++ r
                                             }) bs >>= (\s -> return $ "\\begin{itemize}\n" ++ s ++ "\n\\end{itemize}\n")

instance Node_ Numbered where
  texify (Numbered bs) = concatMapM (\b -> do { r <- concatMapM texify b
                                              ; return $ "\n\\item\n" ++ r
                                              }) bs >>= (\s -> return $ "\\begin{enumerate}\n" ++ s ++ "\n\\end{enumerate}\n")

makecspec numCols = "{|" ++ (concat $ (take numCols (repeat ("p{" ++ cw ++ "}|")))) ++ "}"
  where cw = (show ((availablePageWidthIn - 0.5) / (fromIntegral numCols))) ++ "in"

instance Node_ Table where
  texify (Table rows) = do {
      rs <- mapM (\cols -> do { ss <- mapM (concatMapM texify) cols
                              ; return $ concat $ intersperse " & " ss
                              })
                 rows
    ; s <- return $ concat $ intersperse "\\\\\n\\hline\n" rs
    ; return $ "\n\n\\footnotesize\n\\begin{tabular}" ++
               makecspec (length (head rows)) ++
               "\n\\hline\n" ++ s ++ "\n\\\\\\hline\n\\end{tabular}\n\n\\normalsize\n"
    }

data ParseState = ParseState {  
  _firstChar :: Bool,
  _oddUnderscore :: Bool
}

(<|>) = (P.<|>)

type Parser a = P.GenParser Char ParseState a

-- Lifts a simple parser to one which keeps track of whether or not we're on the first char of a line.
liftp :: Parser a -> (a -> Char) -> Parser a
liftp p lastChar = do
  r <- p
  P.updateState (\s -> s { _firstChar = (lastChar r == '\n') })
  return r

myChar c = liftp (P.char c) id
myAnyChar = liftp P.anyChar id
myString s = liftp (P.string s) last
mySatisfy p = liftp (P.satisfy p) id

ensureFirstChar :: Parser a -> Parser a
ensureFirstChar p = do
  s <- P.getState
  (if _firstChar s then p else fail "Not first char")

heading :: Parser Node
heading = ensureFirstChar $ do
  level <- P.many1 (myChar '=')
  P.many (P.satisfy (\c -> c == ' ' || c == '\t'))
  title <- P.many1 (mySatisfy (/= '='))
  P.many1 (myChar '=')
  return $ Node $ Heading { _level = length level, _title = removeBangs title }

paragraphBreak :: Parser Node
paragraphBreak = P.try (myChar '\n' >> P.many1 (myChar '\n') >>
                 P.updateState (\s -> s { _oddUnderscore = True }) >>
                 return (Node ParagraphBreak))

singleBlank :: Parser Node
singleBlank = myChar '\n' >> return (Node (Text { _text = "\n", _style = plainStyle }))

literal :: Parser Node
literal = ensureFirstChar $ do
    myString "{{{"
    contents <- P.manyTill myAnyChar (P.try (ensureFirstChar (myString "}}}")))
    return $ Node $ Literal { _contents = contents }

data Elt = Lit String | Op String deriving Show

many1Until' :: Parser a -> Parser b -> [a] -> Parser ([a], Maybe b)
many1Until' m u l =
  (u >>= (\r -> return (l, Just r))) <|>
  (m >>= (\r -> many1Until' m u (r:l))) <|>
  (return (l, Nothing))

many1Until m u = do
  (l,f) <- many1Until' m u []
  (case l of
     [] ->
       case f of
         Nothing -> fail "Need elements"
         _ -> return ([], f)
     _  -> return (reverse l, f))

-- Underscores are a PITA, since when they're word-internal we don't want to treat
-- them as the start of italics.
underscore :: Parser String
underscore = do
  s <- P.getState
  c <- (case _firstChar s of
          True -> myString "_"
          False ->
            case _oddUnderscore s of
              True -> (mySatisfy (\c -> c == ' ' || c == '\t')) >> (myString "_")
              False -> myString "_")
  P.updateState (\s -> s { _oddUnderscore = not (_oddUnderscore s) })
  return c

-- Note inclusion of "||" as an Op -- helpful when parsing tables.
text' :: [Elt] -> Parser [Elt]
text' elts = (do {
  (l, m) <- (many1Until (mySatisfy (/= '\n'))
                        ((myString "*") <|> (myString "`") <|>
                         (P.try (myString "~~")) <|> (myString "^") <|>
                         (P.try (myString ",,")) <|> (P.try underscore) <|>
                         (P.try (myString "||"))));
  (case m of
     Just x ->
       case x of -- Special behavior: stop entirely when we get to "||".
         "||" -> return ((Op x):(Lit l):elts)
         _    -> text' ((Op x):(Lit l):elts)
     Nothing -> text' ((Lit l):elts));
  }) <|> (return elts)

addFormatting' :: [Elt] -> (Style, [Text])
addFormatting' = foldl f (plainStyle, [Text { _style = plainStyle, _text = "" }])
  where f (style,ts@(t:t')) elt = case elt of
                             Op "*"  -> let s' = style { _bold = not (_bold style) }
                                        in (s', (Text { _style = s', _text = "" }):ts)
                             Op "_"  -> let s' = style { _italic = not (_italic style) }
                                        in (s', (Text { _style = s', _text = ""}):ts)
                             Op "`"  -> let s' = style { _inline = not (_inline style) }
                                        in (s', (Text { _style = s', _text = ""}):ts)
                             Op "~~" -> let s' = style { _strikeout = not (_strikeout style) }
                                        in (s', (Text { _style = s', _text = "" }):ts)
                             Op "^"  -> let s' = style { _superscript = not (_superscript style) }
                                        in (s', (Text { _style = s', _text = "" }):ts)
                             Op ",," -> let s' = style { _subscript = not (_subscript style) }
                                        in (s', (Text { _style = s', _text = "" }):ts)
                             -- Handle the unlikely case where this appears outside a table.
                             Op "||" -> (style, (Text { _style=style, _text = "||" }):ts)
                             Lit txt   -> (style, (t { _text = removeBangs txt }):t')

-- You can use `*` to escape an asterisk, for example.
doEscapes :: [Text] -> [Text]
doEscapes = map esc
  where esc t = if _inline (_style t) && (_text t) == "*" || (_text t) == "_" || (_text t == "`") || (_text t == "~~") || (_text t == "^") || (_text t == ",,")
                  then t { _style = plainStyle }
                  else t

addFormatting :: [Elt] -> [Text]
addFormatting = doEscapes . reverse . snd . addFormatting' 

text'' :: Parser [Text]
text'' = do
  r <- text' []
  (case r of
     [] -> fail "Must get some text"
     _  ->  return $ addFormatting $ reverse r)

text :: Parser Node
text = do
  r <- text''
  return $ Node $ MultiNode r

bullet :: Char -> Parser ()
bullet c = ensureFirstChar $
  (P.try (myString "  " >> P.many (mySatisfy (\c -> c == ' ' || c == '\t')) >> myChar c >> return ()))
  <|>
  (P.try (myChar c >> P.many1 (mySatisfy (\c -> c == ' ' || c == '\t')) >> return ()))

bulletp :: Char -> Parser [Text]
bulletp c = do
  bullet c
  text'';

bullets :: Parser Node
bullets = P.sepEndBy1 (P.try (bulletp '*')) (myChar '\n') >>= (return . Node . Bullets)

numbered :: Parser Node
numbered = P.sepEndBy1 (P.try (bulletp '#')) (myChar '\n') >>= (return . Node . Numbered)

addhead :: [[a]] -> [a] -> [[a]]
addhead [] x = [x]
addhead (xs:ys) l = (xs ++ l):ys

butlast [] = []
butlast (x:[]) = []
butlast (x:xs) = x:(butlast xs)

tableRow' :: [[Text]] -> Parser [[Text]]
tableRow' rows = do
  t <- text' [] >>= (return . reverse)
  (case t of
     [] -> return rows
     _  -> case last t of
             Lit _   -> return $ addhead rows (addFormatting t)
             Op "||" -> tableRow' ([]:(addhead rows (addFormatting (butlast t))))
             _       -> tableRow' (addhead rows (addFormatting t)))

tableRow :: Parser [[Text]]
tableRow = ensureFirstChar $ do
  P.many (mySatisfy (\c -> c == ' ' || c == '\t'))
  myString "||"
  r <- tableRow' []
  return $ reverse $ filter (not . null) $ r

table :: Parser Node
table = P.sepEndBy1 (P.try tableRow) (myChar '\n') >>= (return . Node . Table . (filter (not . null)))

-- We ignore lines that begin with 10 spaces. This allows a link to the PDF
-- to be placed in the manual source code without it appearing in the PDF itself.
special :: Parser Node
special = ensureFirstChar $ do
  myString "          "
  P.many (mySatisfy (\c -> c /= '\n'))
  return (Node (Text { _style=plainStyle, _text="" }))

ignorePragmas :: Parser ()
ignorePragmas = P.sepEndBy (myChar '#' >> P.many (mySatisfy (/= '\n'))) (P.char '\n') >>
                return ()

document :: Parser [Node]
document = ignorePragmas >>
           P.many (foldl1 (<|>) (map P.try [special, heading, paragraphBreak,
                                            singleBlank, literal, numbered,
                                            bullets, table, text]))

parseDocs :: String -> Either P.ParseError [Node]
parseDocs = P.runParser document (ParseState { _firstChar = True, _oddUnderscore = True }) ""

fromRight :: Either a b -> b
fromRight (Right x) = x
fromRight _ = error "!!"

nodesToTex :: [Node] -> IO ()
nodesToTex nodes = do
  mapM (putStr . texifyNode) nodes
  return ()

main :: IO ()
main = do
  args <- getArgs
  h <- openFile (head args) ReadMode
  c <- hGetContents h
  (case parseDocs c of
     Left e -> print e
     Right nodes -> do
       putStr preamble
       putStr "\n"
       putStr $ "\\begin{document}\n\n\\date{}\n\\author{" ++
                (texescape' author) ++
                "}\n\\title{Ibex " ++
                (texescape' (args!!1)) ++
                " Manual}\n\n\\maketitle\n\n\\tableofcontents\n\n"
       nodesToTex nodes
       putStr "\n\\end{document}\\n")
  hClose h

testp :: Parser a -> String -> a
testp p s = fromRight (P.runParser p (ParseState { _firstChar = True, _oddUnderscore = True}) "" s)

test :: String -> IO ()
test s = do
  nodesToTex $ fromRight (parseDocs s)
  putStr "\n"