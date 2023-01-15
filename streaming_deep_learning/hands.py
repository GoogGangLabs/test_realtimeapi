import cv2
import numpy
import mediapipe as mp
import base64

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

def toImage(base64Data):
  imageData = base64.b64decode(base64Data)
  np_data = numpy.fromstring(imageData, numpy.uint8)
  return cv2.imdecode(np_data, cv2.IMREAD_UNCHANGED)

def process(base64Data):
  image = toImage(base64Data)

  with mp_hands.Hands(
    static_image_mode = True,
    max_num_hands = 1,
    min_detection_confidence = 0.5
  ) as hands:

    results = hands.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

    if results.multi_hand_landmarks:
      for hand_landmarks in results.multi_hand_landmarks:

        mp_drawing.draw_landmarks(
          image,
          hand_landmarks,
          mp_hands.HAND_CONNECTIONS
        )

    _, buffer = cv2.imencode('.jpeg', image)

    return str(base64.b64encode(buffer), 'utf-8')
