import cv2
import numpy
import mediapipe as mp
import base64

mp_holistic = mp.solutions.holistic

def toImage(base64Data):
  imageData = base64.b64decode(base64Data)
  np_data = numpy.fromstring(imageData, numpy.uint8)
  return cv2.imdecode(np_data, cv2.IMREAD_UNCHANGED)

def get_landmark_list(landmarks):
  if landmarks is None:
    return []

  landmark_list = []

  for _, landmark in enumerate(landmarks.landmark):
    element = {}

    element['x'] = landmark.x
    element['y'] = landmark.y
    element['z'] = landmark.z
    element['visibility'] = landmark.visibility

    landmark_list.append(element)
  
  return landmark_list

def process(base64Data):
  image = toImage(base64Data)

  with mp_holistic.Holistic(static_image_mode=True) as holistic:

    results = holistic.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

    return {
      'left_hand': get_landmark_list(results.left_hand_landmarks),
      'right_hand': get_landmark_list(results.right_hand_landmarks),
      'pose': get_landmark_list(results.pose_landmarks),
      'face': get_landmark_list(results.face_landmarks)
    }
